# backend/database.py
import firebase_admin
from firebase_admin import credentials, firestore

# The SDK will automatically find the credentials from the environment variable
firebase_admin.initialize_app() 
db = firestore.client()