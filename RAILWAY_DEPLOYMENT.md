# Railway Deployment Guide

## Backend Deployment

1. **Create new Railway project** for backend
2. **Connect your GitHub repo** - select the `backend` folder
3. **Add environment variables** in Railway dashboard:
   - `GEMINI_API_KEY=your_actual_gemini_key_here`
4. **Deploy** - Railway will automatically detect Python and use the Procfile

## Frontend Deployment

1. **Create another Railway project** for frontend  
2. **Connect your GitHub repo** - select the `frontend` folder
3. **Add environment variable** in Railway dashboard:
   - `REACT_APP_API_BASE_URL=https://your-backend-url.railway.app`
   - (Replace with your actual backend URL from step 1)
4. **Deploy** - Railway will automatically detect React and build it

## Important Notes

- **Two separate Railway projects** are needed (one for backend, one for frontend)
- **Backend URL**: Use the Railway-provided URL for your backend service
- **Environment Variables**: Critical for proper API communication
- **CORS**: Already configured in backend for cross-origin requests

## Local Development

Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:3000

Both use environment variables for configuration.