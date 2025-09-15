export interface KeyHighlight {
  field: string;
  value: string;
}

export interface Document {
  doc_type: string;
  title: string;
  page_start: number;
  page_end: number;
  confidence: number;
  summary: string;
  key_highlights: KeyHighlight[];
  filename?: string;
  download_url?: string;
}