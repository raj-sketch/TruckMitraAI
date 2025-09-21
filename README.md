# truckmitraai

A logistics platform prototype using FastAPI, React, Firebase, and Google Maps.

## Project Structure
- `/backend`: The FastAPI application.
- `/frontend`: The React (Vite) application.

## Getting Started

### Environment Variables

Create a `.env` file in the project root. This file will be used by both the frontend and backend.

```env
# Example .env file
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
# Add other secrets like Firebase credentials path, database URLs, etc.
```

## Backend Setup

1. Install dependencies:
	```sh
	pip install fastapi uvicorn python-dotenv firebase-admin "passlib[bcrypt]" python-jose
	```
2. Run the FastAPI server:
	```sh
	uvicorn backend.main:app --reload
	```

## Frontend Setup

1. Install dependencies:
	```sh
	npm install axios react-router-dom @react-google-maps/api tailwindcss postcss autoprefixer
	npx tailwindcss init -p
	```
2. Configure Tailwind in `tailwind.config.js` and add Tailwind directives to `src/index.css`:
	```css
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	```
3. Start the development server:
	```sh
	npm run dev
	```

4. API integration:
	- Use `fetch` or `axios` to connect to FastAPI backend endpoints.
	- Example base URL: `http://127.0.0.1:8000/`
