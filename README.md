# truckmitraai

A logistics platform prototype using FastAPI, React, Firebase, and Google Maps.
## Backend Setup

1. Install dependencies:
	```sh
	pip install fastapi uvicorn firebase-admin
	```
2. Run the FastAPI server:
	```sh
	uvicorn backend.main:app --reload
	```

## Frontend Setup

1. Install dependencies:
	```sh
	npm install
	npm install tailwindcss postcss autoprefixer
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


