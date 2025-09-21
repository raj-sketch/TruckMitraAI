import json
import os
import sys

# Add project root to the Python path to allow imports from 'backend'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

try:
    from backend.database import db
    from backend.security import get_password_hash
    from backend.models import User
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    print("Please ensure you are running this script from the project root directory.")
    sys.exit(1)


def seed_database():
    """
    Seeds the Firestore database with users from user.json.

    This script will:
    1. Read the user data from user.json.
    2. For each user, assign a default password 'password123'.
    3. Hash the password.
    4. Add the user to the 'users' collection in your Firestore database.
       It will overwrite existing users with the same email.
    """
    if not db:
        print("🔥 Firestore database is not initialized. Please check your Firebase credentials.")
        return

    try:
        with open('user.json', 'r') as f:
            users_to_seed = json.load(f)
    except FileNotFoundError:
        print("❌ Error: user.json not found in the project root directory.")
        return
    except json.JSONDecodeError:
        print("❌ Error: Could not decode user.json. Please ensure it is valid JSON.")
        return

    print("🌱 Starting to seed database...")
    users_collection = db.collection('users')

    for user_data in users_to_seed:
        email = user_data.get("email")
        if not email:
            print(f"⚠️ Skipping record due to missing email: {user_data}")
            continue

        print(f"  - Processing user: {email} ({user_data.get('role')})")
        hashed_password = get_password_hash("password123")
        user_db = User(email=email, role=user_data["role"], hashed_password=hashed_password)
        users_collection.document(email).set(user_db.model_dump())

    print("\n✅ Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()