# Railway Monolithic Deployment Guide

## Overview
This app is now configured for **monolithic deployment** - Flask serves both the API and React frontend from a single service.

## Pre-deployment Setup

1. **Build the React app**:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```

2. **Project Structure** (after build):
   ```
   /your-repo
   ├── app.py (Flask backend + React server)
   ├── gemini_service.py
   ├── pdf_service.py
   ├── requirements.txt
   ├── Procfile
   ├── .env (local only - not pushed)
   ├── build/ (React production files)
   └── frontend/ (React source code)
   ```

## Railway Deployment

1. **Create Railway project**
2. **Connect GitHub repo** (root directory)
3. **Add environment variable**:
   - `GEMINI_API_KEY=your_actual_gemini_key_here`
4. **Deploy** - Railway auto-detects Python and uses Procfile

## How it works

- **Flask serves React**: `app.py` serves React build files from `/build` directory
- **API routes**: `/health`, `/process_document`, `/download/<filename>`
- **Frontend routes**: All other routes serve React app (SPA routing)
- **Single domain**: No CORS issues, everything on one URL

## Local Testing

```bash
# Build and test locally
./build.sh
source backend/venv/bin/activate
python app.py
```

Open http://localhost:5000 - you'll see the React app served by Flask!

## Benefits of Monolithic Deployment

✅ **Single Railway service** (easier + cheaper)  
✅ **Single domain** (no CORS complexity)  
✅ **Simpler deployment** (one build, one deploy)  
✅ **Better for small apps** like this POC