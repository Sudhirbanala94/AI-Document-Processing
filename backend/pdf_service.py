import os
from PyPDF2 import PdfReader, PdfWriter
from typing import List, Dict, Any

class PDFService:
    def __init__(self, split_documents_folder: str):
        self.split_documents_folder = split_documents_folder
    
    def split_pdf_by_ranges(self, source_pdf_path: str, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Split PDF based on page ranges from Gemini API response
        Returns updated documents list with download_url added
        """
        try:
            reader = PdfReader(source_pdf_path)
            total_pages = len(reader.pages)
            
            updated_documents = []
            
            for i, doc in enumerate(documents):
                page_start = doc['page_start']
                page_end = doc['page_end']
                
                # Validate page ranges
                if page_start < 1 or page_end > total_pages or page_start > page_end:
                    print(f"Invalid page range for document {i}: {page_start}-{page_end}")
                    continue
                
                # Create new PDF with specified pages
                writer = PdfWriter()
                
                # PyPDF2 uses 0-based indexing, but Gemini returns 1-based
                for page_num in range(page_start - 1, page_end):
                    writer.add_page(reader.pages[page_num])
                
                # Generate filename
                doc_type = doc.get('doc_type', 'document')
                filename = f"{doc_type}_{i+1}_pages_{page_start}-{page_end}.pdf"
                output_path = os.path.join(self.split_documents_folder, filename)
                
                # Write split PDF
                with open(output_path, 'wb') as output_file:
                    writer.write(output_file)
                
                # Update document info with download URL
                doc_copy = doc.copy()
                doc_copy['filename'] = filename
                doc_copy['download_url'] = f"/download/{filename}"
                updated_documents.append(doc_copy)
            
            return updated_documents
        
        except Exception as e:
            raise Exception(f"Failed to split PDF: {str(e)}")
    
    def cleanup_files(self, *file_paths):
        """Clean up temporary files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Failed to cleanup file {file_path}: {e}")
    
    def cleanup_split_documents(self):
        """Clean up all split documents"""
        try:
            for filename in os.listdir(self.split_documents_folder):
                file_path = os.path.join(self.split_documents_folder, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"Failed to cleanup split documents: {e}")