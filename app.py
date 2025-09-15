from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import base64
import json
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from gemini_service import GeminiService
from pdf_service import PDFService

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
SPLIT_DOCUMENTS_FOLDER = 'split_documents'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SPLIT_DOCUMENTS_FOLDER'] = SPLIT_DOCUMENTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Initialize services
gemini_service = GeminiService()
pdf_service = PDFService(SPLIT_DOCUMENTS_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI-Document Processing Backend is running'})

@app.route('/process_document', methods=['POST'])
def process_document():
    file_path = None
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process document with Gemini API
        print(f"Processing document: {filename}")
        gemini_response = gemini_service.process_document(file_path)
        
        # Extract documents from Gemini response
        documents = gemini_response.get('documents', [])
        
        if not documents:
            return jsonify({'error': 'No documents found in the uploaded file'}), 400
        
        # Split PDF based on Gemini's page ranges
        print(f"Splitting PDF into {len(documents)} documents")
        split_documents = pdf_service.split_pdf_by_ranges(file_path, documents)
        
        response_data = {
            'message': 'Document processed successfully',
            'filename': filename,
            'total_documents': len(split_documents),
            'documents': split_documents
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"Error processing document: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    finally:
        # Clean up uploaded file
        if file_path and os.path.exists(file_path):
            pdf_service.cleanup_files(file_path)

@app.route('/download/<filename>')
def download_file(filename):
    try:
        return send_from_directory(app.config['SPLIT_DOCUMENTS_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

# Serve React App
@app.route('/')
def serve_react_app():
    return send_file('build/index.html')

# Handle React Router (catch-all for frontend routes)
@app.route('/<path:path>')
def serve_react_routes(path):
    # Serve static files first
    if path.startswith('static/'):
        return send_from_directory('build', path)
    # For all other routes, serve the React app
    return send_file('build/index.html')

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(SPLIT_DOCUMENTS_FOLDER, exist_ok=True)
    
    # Railway provides PORT environment variable
    port = int(os.environ.get('PORT', 5000))
    # Use production settings for Railway
    is_production = os.environ.get('RAILWAY_ENVIRONMENT_NAME') is not None
    app.run(host='0.0.0.0', port=port, debug=not is_production)