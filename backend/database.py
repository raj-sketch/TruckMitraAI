# backend/database.py
import firebase_admin
from firebase_admin import credentials, firestore
import os
import pathlib
from dotenv import load_dotenv

# Load environment variables from .env file
project_root = pathlib.Path(__file__).parent.parent
dotenv_path = project_root / ".env"
load_dotenv(dotenv_path=dotenv_path)

# Initialize db to None. It will be populated if Firebase initializes correctly.
db = None

cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not cred_path:
    print("---")
    print("⚠️  WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
    print("    Firebase will not be initialized. The application will not connect to the database.")
    print("    Please create a .env file in the project root and set the variable.")
    print("---")
else:
    try:
        if not os.path.exists(cred_path):
             raise FileNotFoundError(f"The service account file was not found at the specified path: {cred_path}")
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase initialized successfully.")
        collections = list(db.collections())
        print(f"✅ Successfully connected to Firestore. Found {len(collections)} collections.")
    except Exception as e:
        print("---")
        print(f"🔥 FAILED to initialize Firebase or connect to Firestore.")
        print(f"   Error: {e}")
        print("   Troubleshooting steps:")
        print("   1. Verify the GOOGLE_APPLICATION_CREDENTIALS path in your .env file is correct.")
        print("   2. Ensure the JSON file is a valid Firebase service account key.")
        print("   3. Check your internet connection and Firebase project status.")
        print("---")
