import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('backend/truckmitraai-firebase-adminsdk-fbsvc-17de396304.json')
firebase_admin.initialize_app(cred)
db = firestore.client()