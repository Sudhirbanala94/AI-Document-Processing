import requests
import json
import base64
import os
from typing import Dict, Any

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
    
    def encode_pdf_to_base64(self, file_path: str) -> str:
        """Convert PDF file to base64 string for API submission"""
        with open(file_path, 'rb') as file:
            return base64.b64encode(file.read()).decode('utf-8')
    
    def create_request_payload(self, pdf_base64: str) -> Dict[str, Any]:
        """Create the exact request payload as specified in requirements"""
        return {
            "systemInstruction": {
                "parts": [
                    {
                        "text": "You are a mortgage document pack classifier and summarizer. Return ONLY JSON that matches the schema. Infer doc_type yourself (no predefined list). Normalize doc_type to short snake_case (e.g., w2, paystub, bank_statement). Identify page ranges within the bundle (1-based inclusive). Provide a DETAILED, COMPREHENSIVE summary paragraph that includes: document type, time period covered, issuing entity, key financial figures, and significance for mortgage underwriting. Include a confidence score (0.0-1.0) for your classification. Follow privacy rules: mask SSNs and full account numbers (use last4); minimize PII; use ISO dates (YYYY-MM-DD). If a type is unclear, set doc_type='other' and explain thoroughly in summary."
                    }
                ]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "object",
                    "properties": {
                        "documents": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "doc_type": {"type": "string"},
                                    "title": {"type": "string"},
                                    "page_start": {"type": "integer", "minimum": 1},
                                    "page_end": {"type": "integer", "minimum": 1},
                                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                                    "summary": {"type": "string"},
                                    "key_highlights": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "field": {"type": "string"},
                                                "value": {"type": "string"}
                                            },
                                            "required": ["field", "value"]
                                        }
                                    }
                                },
                                "required": ["doc_type", "title", "page_start", "page_end", "confidence", "summary", "key_highlights"]
                            }
                        }
                    },
                    "required": ["documents"]
                },
                "maxOutputTokens": 10000
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": "Classify all sub-documents in this file and return only JSON per the schema. For images, set page_start=1 and page_end=1. Title should be a human-friendly heading found on the document. summary: write a DETAILED, INFORMATIVE paragraph (3-5 sentences) describing the document type, time period, issuing organization, key financial information, and its relevance to mortgage underwriting. Include specific details that would help an underwriter understand the document's significance. confidence: provide a decimal score 0.0-1.0 indicating your certainty in the classification. key_highlights: include 3–10 key fields as {field, value} pairs relevant to mortgage processing (examples if present: tax_year, employer, wages_box1, federal_withholding_box2; pay_period_start, gross_pay, net_pay; statement_period_start, ending_balance, account_last4; property_address, est_value_or_loan_amount, issue_or_closing_date). Use last4 for any identifiers; omit full SSNs and full account numbers."
                        },
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": pdf_base64
                            }
                        }
                    ]
                }
            ]
        }
    
    def process_document(self, file_path: str) -> Dict[str, Any]:
        """Process PDF document through Gemini API"""
        try:
            # Encode PDF to base64
            pdf_base64 = self.encode_pdf_to_base64(file_path)
            
            # Create request payload
            payload = self.create_request_payload(pdf_base64)
            
            # Make API request
            headers = {
                'Content-Type': 'application/json',
            }
            
            url = f"{self.endpoint}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract the generated content
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    return json.loads(content)
                else:
                    raise Exception("No valid response from Gemini API")
            else:
                raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            raise Exception(f"Failed to process document with Gemini: {str(e)}")