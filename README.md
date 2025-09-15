# AI-Document Processing Demo

An AI-powered document processing system that classifies, extracts, and summarizes mortgage documents using Google Gemini API.

## 🚀 Features

- **PDF Upload**: Drag-and-drop interface for uploading mortgage document bundles
- **AI Classification**: Automatic document type identification using Gemini 2.0-flash
- **Smart Extraction**: Key data extraction with confidence scores
- **Document Splitting**: Automatically splits multi-page PDFs into individual documents
- **PDF Preview**: Inline preview with pagination controls
- **Human Review**: Clean interface for reviewing and editing AI results
- **Export Options**: Download split documents and copy extracted data

## 🏗️ Architecture

- **Monolithic Deployment**: Single Flask app serves React frontend + API
- **Frontend**: React with TypeScript and modern SaaS-style UI
- **Backend**: Python Flask API with file processing
- **AI Engine**: Google Gemini 2.0-flash API
- **PDF Processing**: PyPDF2 for document splitting

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+ (for building frontend)
- Google Gemini API key

## 🛠️ Local Development Setup

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd AI-Document\ Processing
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Build Frontend
```bash
# Build React production files
chmod +x build.sh
./build.sh
```

### 4. Run Application
```bash
# Start the monolithic server
source backend/venv/bin/activate
python app.py
```

**Application will run on http://localhost:5000** 🎉

## 🚀 Railway Deployment

### Quick Deploy
1. **Push to GitHub** (your API key is protected in .env)
2. **Create Railway project** → Connect GitHub repo (root directory)
3. **Add environment variable**: `GEMINI_API_KEY=your_actual_key_here`
4. **Deploy** - Railway auto-detects Python and builds everything

### Deployment Benefits
- ✅ **Single service** deployment (simpler + cheaper)
- ✅ **No CORS issues** (single domain)
- ✅ **Railway optimized** with Procfile
- ✅ **Production ready** with environment variables

See `RAILWAY_DEPLOYMENT_MONOLITHIC.md` for detailed deployment guide.

## 📊 Usage

1. **Upload**: Drag and drop a PDF file containing multiple mortgage documents
2. **Processing**: Wait for AI processing (typically 30-60 seconds)
3. **Review**: Browse classified documents with AI summaries and extracted key fields
4. **Edit**: Click "Edit" to modify any extracted data
5. **Preview**: Use pagination controls to navigate through document pages
6. **Download**: Download individual split documents
7. **Copy**: Copy extracted data to clipboard

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves React application |
| `GET` | `/health` | Health check |
| `POST` | `/process_document` | Upload and process PDF |
| `GET` | `/download/<filename>` | Download split document |

## 📄 Supported Document Types

The system can automatically identify:
- **Tax Documents**: W-2 forms, 1099s, tax returns
- **Income Verification**: Pay stubs, employment letters
- **Financial Statements**: Bank statements, investment accounts
- **Property Documents**: Appraisals, title documents
- **Loan Documents**: Loan estimates, closing disclosures
- **And more...** (system adapts to new document types)

## 🔧 Project Structure

```
AI-Document Processing/
├── app.py                 # Main Flask application
├── gemini_service.py      # Gemini API integration
├── pdf_service.py         # PDF processing utilities
├── requirements.txt       # Python dependencies
├── Procfile              # Railway deployment config
├── build.sh              # Frontend build script
├── build/                # React production files (generated)
├── frontend/             # React source code
└── .env                  # Environment variables (local only)
```

## 🐛 Troubleshooting

### Common Issues
- **API Key**: Ensure your Gemini API key is valid and has sufficient quota
- **File Format**: Only PDF files are supported
- **File Size**: Maximum upload size is 50MB
- **Processing Time**: Large documents may take up to 2 minutes

### Getting Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file or Railway environment variables

### Performance Notes
- Processing time depends on document size and complexity
- First request may be slower due to cold start
- Gemini API has rate limits - check your quota

## 🔒 Security

- API keys are environment variables only
- No sensitive data in source code
- Comprehensive .gitignore protects secrets
- Production-ready for Railway deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `./build.sh && python app.py`
5. Submit a pull request

## 📄 License

This project is a POC/Demo application for mortgage document processing.