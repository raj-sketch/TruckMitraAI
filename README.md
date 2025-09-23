# TruckMitraAI

A comprehensive logistics platform connecting shippers and drivers for efficient load management, built with FastAPI, React, and Firebase.

## 🚀 Quick Start

### Automated Setup (Recommended)
1. Run the setup script: `setup_project.bat`
2. Place your Firebase service account key as `serviceAccountKey.json`
3. Start backend: `start_server.bat`
4. Start frontend: `start_frontend.bat`

### Manual Setup

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Firebase project with Firestore enabled

#### Backend Setup
1. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   - Create `.env` file (already provided with defaults)
   - Place your Firebase service account key as `serviceAccountKey.json`

4. Start server:
   ```bash
   python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# JWT Secret Key (CHANGE IN PRODUCTION!)
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-12345

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Backend Configuration
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Generate a service account key
4. Download and place as `serviceAccountKey.json` in project root

## 📁 Project Structure
```
TruckMitraAI/
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   ├── models.py           # Pydantic models
│   ├── database.py         # Firebase connection
│   ├── security.py         # JWT authentication
│   └── main.py            # FastAPI app
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── api.js         # API client
│   └── package.json
├── .env                   # Environment variables
├── requirements.txt       # Python dependencies
└── start_server.bat       # Backend startup script
```

## 🎯 Features

### For Shippers
- Create and manage loads
- Track load status
- View delivery analytics
- Monitor driver assignments

### For Drivers
- Browse available loads
- Accept loads
- Track active deliveries
- Update delivery status

### System Features
- JWT-based authentication
- Real-time load tracking
- Firebase Firestore database
- Responsive React UI
- CORS-enabled API

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/token` - User login

### Loads Management
- `POST /loads/` - Create new load (Shippers)
- `GET /loads/shipper/me` - Get shipper's loads
- `GET /loads/available` - Get available loads (Drivers)
- `PUT /loads/{id}/accept` - Accept load (Drivers)
- `PUT /loads/{id}/deliver` - Mark as delivered
- `GET /loads/my-active` - Get driver's active loads

### User Management
- `GET /users/me` - Get current user info

## 🚨 Troubleshooting

### Database Connection Issues
1. Verify `serviceAccountKey.json` exists and is valid
2. Check Firebase project settings
3. Ensure Firestore is enabled
4. Verify internet connection

### Authentication Issues
1. Check `SECRET_KEY` in `.env` file
2. Verify JWT token expiration
3. Clear browser localStorage if needed

### CORS Issues
1. Verify `FRONTEND_URL` in `.env`
2. Check backend CORS configuration
3. Ensure frontend runs on correct port

## 📝 Development Notes

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- API documentation available at `http://localhost:8000/docs`
- Uses Firebase Firestore for data persistence
- Implements JWT-based authentication
- Supports both shipper and driver user roles

## 🔒 Security Considerations

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement proper Firebase security rules
- Validate all user inputs
- Use environment variables for sensitive data
