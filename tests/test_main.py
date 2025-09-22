import sys
import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add project root to the Python path to allow imports from 'backend'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# We need to patch the db initialization before it's imported by the app
# This is a crucial step to prevent a real Firebase connection during tests.
mock_db = MagicMock()

with patch('backend.database.db', mock_db):
    from backend.main import app
    from backend.security import get_password_hash

client = TestClient(app)

# --- Test Data ---
TEST_SHIPPER_USER = {
    "email": "shipper@example.com",
    "password": "password123",
    "role": "shipper",
    "user_name": "Test Shipper"
}

TEST_LOADER_USER = {
    "email": "loader@example.com",
    "password": "password123",
    "role": "loader",
    "user_name": "Test Loader"
}

@pytest.fixture
def authenticated_user_mock():
    """
    A fixture that mocks the database call made by `get_current_user`.
    This is crucial for testing any authenticated endpoint.
    """
    def _setup_mock(user_data):
        hashed_password = get_password_hash(user_data["password"])
        mock_user_doc = {
            "email": user_data["email"],
            "hashed_password": hashed_password,
            "role": user_data["role"],
            "user_name": user_data["user_name"],
        }
        mock_user_get = MagicMock()
        mock_user_get.exists = True
        mock_user_get.to_dict.return_value = mock_user_doc
        # This is the specific mock for get_current_user's DB call
        mock_db.collection("users").document(user_data["email"]).get.return_value = mock_user_get
    
    return _setup_mock

@pytest.fixture(autouse=True)
def reset_db_mock():
    """
    Reset the mock database before each test to ensure test isolation.
    """
    mock_db.reset_mock()


def get_auth_token(user_data):
    """Helper function to register and log in a user to get a token."""
    # Mock for registration check
    mock_user_get = MagicMock()
    mock_user_get.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_user_get
    
    # Perform registration
    client.post("/auth/register", json=user_data)

    # Mock for login
    hashed_password = get_password_hash(user_data["password"])
    mock_user_doc = {
        "email": user_data["email"],
        "hashed_password": hashed_password,
        "role": user_data["role"],
        "user_name": user_data["user_name"],
    }
    mock_user_get.exists = True
    mock_user_get.to_dict.return_value = mock_user_doc
    mock_db.collection.return_value.document.return_value.get.return_value = mock_user_get

    # Perform login
    response = client.post(
        "/auth/token",
        data={"username": user_data["email"], "password": user_data["password"]},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


# === Authentication Tests (routers/auth.py) ===

def test_register_user_success():
    """Test successful registration of a new user."""
    # Mock Firestore's get().exists to return False (user does not exist)
    mock_user_get = MagicMock()
    mock_user_get.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_user_get

    response = client.post("/auth/register", json=TEST_SHIPPER_USER)

    assert response.status_code == 201
    assert response.json() == {"message": "User registered successfully"}
    mock_db.collection.return_value.document.return_value.set.assert_called_once()

def test_register_user_email_exists():
    """Test that registration fails if the email already exists."""
    # Mock Firestore's get().exists to return True (user exists)
    mock_user_get = MagicMock()
    mock_user_get.exists = True
    mock_db.collection.return_value.document.return_value.get.return_value = mock_user_get

    response = client.post("/auth/register", json=TEST_SHIPPER_USER)

    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

def test_login_success():
    """Test successful user login and token generation."""
    hashed_password = get_password_hash(TEST_SHIPPER_USER["password"])
    mock_user_doc = {
        "email": TEST_SHIPPER_USER["email"],
        "hashed_password": hashed_password,
        "role": TEST_SHIPPER_USER["role"],
        "user_name": TEST_SHIPPER_USER["user_name"],
    }

    mock_user_get = MagicMock()
    mock_user_get.exists = True
    mock_user_get.to_dict.return_value = mock_user_doc
    mock_db.collection.return_value.document.return_value.get.return_value = mock_user_get

    response = client.post(
        "/auth/token",
        data={"username": TEST_SHIPPER_USER["email"], "password": TEST_SHIPPER_USER["password"]},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure_wrong_password():
    """Test that login fails with an incorrect password."""
    # Setup a user in the 'database' with a known password
    hashed_password = get_password_hash("a_different_password")
    mock_user_doc = {
        "email": TEST_SHIPPER_USER["email"],
        "hashed_password": hashed_password,
        "role": TEST_SHIPPER_USER["role"],
        "user_name": TEST_SHIPPER_USER["user_name"],
    }

    mock_user_get = MagicMock()
    mock_user_get.exists = True
    mock_user_get.to_dict.return_value = mock_user_doc
    # Ensure this mock is specific to the user's email
    mock_db.collection("users").document(TEST_SHIPPER_USER["email"]).get.return_value = mock_user_get

    response = client.post(
        "/auth/token", # Attempt to log in with the wrong password
        data={"username": TEST_SHIPPER_USER["email"], "password": TEST_SHIPPER_USER["password"]},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password"}


# === Load Management Tests (routers/loads.py) ===

def test_post_load_success():
    """Test that an authenticated shipper can post a new load."""
    token = get_auth_token(TEST_SHIPPER_USER)
    headers = {"Authorization": f"Bearer {token}"}
    
    load_data = {
        "origin": "Mumbai, India",
        "destination": "Delhi, India",
        "weight": 10000,
        "material_type": "General Goods",
    }

    # Mock the .add() method which is used in post_load
    # It returns a tuple (timestamp, document_reference)
    mock_load_ref = MagicMock()
    mock_load_ref.id = "new_load_id_123"
    mock_db.collection.return_value.add.return_value = (None, mock_load_ref)

    response = client.post("/loads/", json=load_data, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert "load_id" in data
    assert data["load_id"] == "new_load_id_123"
    assert data["message"] == "Load posted successfully"
    
    # Assert that .add() was called, not .set()
    mock_db.collection.return_value.add.assert_called_once()

def test_get_available_loads(authenticated_user_mock):
    """Test that available loads can be retrieved."""
    authenticated_user_mock(TEST_LOADER_USER) # Mock the authenticated user
    token = get_auth_token(TEST_LOADER_USER)
    headers = {"Authorization": f"Bearer {token}"}
    
    mock_load_doc = MagicMock()
    mock_load_doc.id = "load_1"
    mock_load_doc.to_dict.return_value = {
        "shipper_id": "shipper@example.com",
        "origin": "Mumbai, India",
        "destination": "Delhi, India",
        "weight": 10000,
        "status": "stand by",
        "loader_id": None
    }
    mock_db.collection.return_value.where.return_value.stream.return_value = [mock_load_doc]

    response = client.get("/loads/available", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["status"] == "stand by"

def test_get_my_shipper_loads(authenticated_user_mock):
    """Test retrieving all loads for the currently authenticated shipper."""
    authenticated_user_mock(TEST_SHIPPER_USER) # Mock the authenticated user
    token = get_auth_token(TEST_SHIPPER_USER) # get_auth_token still needed for the token itself
    headers = {"Authorization": f"Bearer {token}"}
    shipper_email = TEST_SHIPPER_USER["email"]

    mock_load_doc = MagicMock()
    mock_load_doc.id = "load_2"
    mock_load_doc.to_dict.return_value = {
        "shipper_id": shipper_email,
        "origin": "Pune, India",
        "destination": "Goa, India",
        "weight": 5000,
        "status": "stand by",
        "loader_id": None
    }
    # Mock the full query chain, including the .order_by() call, to accurately
    # reflect the implementation in routers/loads.py.
    mock_db.collection.return_value.where.return_value.order_by.return_value.stream.return_value = [
        mock_load_doc
    ]

    response = client.get("/loads/shipper/me", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["shipper_id"] == shipper_email

def test_get_my_shipper_loads_not_a_shipper(authenticated_user_mock):
    """Test that a non-shipper user cannot retrieve shipper loads."""
    authenticated_user_mock(TEST_LOADER_USER) # Mock the authenticated user
    token = get_auth_token(TEST_LOADER_USER) # Use a loader
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/loads/shipper/me", headers=headers)
    assert response.status_code == 403
    assert response.json() == {"detail": "Only shippers can view their posted loads"}

def test_accept_load_success(authenticated_user_mock):
    """Test that a loader can successfully accept a posted load."""
    authenticated_user_mock(TEST_LOADER_USER)
    token = get_auth_token(TEST_LOADER_USER)
    headers = {"Authorization": f"Bearer {token}"}
    load_id = "test_load_123"

    # Mock for the load document
    mock_load_get = MagicMock()
    mock_load_get.exists = True
    mock_load_get.to_dict.return_value = {"status": "stand by"}
    mock_load_doc_ref = MagicMock()
    mock_load_doc_ref.get.return_value = mock_load_get

    mock_db.collection("loads").document(load_id).get.return_value = mock_load_get

    response = client.put(f"/loads/{load_id}/accept", headers=headers)

    assert response.status_code == 200
    assert response.json() == {"message": "Load accepted", "load_id": load_id}
    mock_load_doc_ref.update.assert_called_with({
        "status": "active",
        "loader_id": TEST_LOADER_USER["email"]
    })

def test_accept_load_not_posted(authenticated_user_mock):
    """Test that accepting a load that is not in 'posted' status fails."""
    authenticated_user_mock(TEST_LOADER_USER)
    token = get_auth_token(TEST_LOADER_USER)
    headers = {"Authorization": f"Bearer {token}"}
    load_id = "test_load_123"

    mock_load_get = MagicMock()
    mock_load_get.exists = True
    mock_load_get.to_dict.return_value = {"status": "active"}  # A non-'stand by' status
    mock_load_doc_ref = MagicMock()
    mock_load_doc_ref.get.return_value = mock_load_get
    mock_db.collection("loads").document(load_id).get.return_value = mock_load_get

    response = client.put(f"/loads/{load_id}/accept", headers=headers)

    assert response.status_code == 400
    assert response.json() == {"detail": "Load not available"}

def test_accept_load_not_found():
    """Test that accepting a non-existent load fails."""
    # No need to mock the user here, as the get_current_user dependency will fail
    # if the user doesn't exist, which is fine for this test's purpose.
    token = get_auth_token(TEST_LOADER_USER) 
    headers = {"Authorization": f"Bearer {token}"}
    load_id = "non_existent_load"

    mock_load_get = MagicMock()
    mock_load_get.exists = False
    mock_db.collection("loads").document(load_id).get.return_value = mock_load_get

    response = client.put(f"/loads/{load_id}/accept", headers=headers)

    assert response.status_code == 404
    assert response.json() == {"detail": "Load not found"}