export type FileType =
  | 'document'
  | 'pdf'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'invoice'
  | 'encrypted';

export interface StudioFile {
  id: string;
  name: string;
  type: FileType;
  content?: string; // HTML, Markdown, raw text, or base64
  data?: any; // Structured sheet data, slides array, invoice schema, etc.
  isFavorite: boolean;
  isEncrypted: boolean;
  size: number;
  createdAt: number;
  updatedAt: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

// Spreadsheet Data Types
export interface SpreadsheetCell {
  value: string;
  formula?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SpreadsheetData {
  sheets: {
    id: string;
    name: string;
    rows: SpreadsheetCell[][]; // Grid of cells
  }[];
}

// Presentation Data Types
export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string; // text content or image base64/url
  x?: number; // percentage or pos
  y?: number;
  width?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
}

export interface Slide {
  id: string;
  title: string;
  layout: 'title' | 'content' | 'two-column' | 'quote' | 'blank';
  elements: SlideElement[];
  speakerNotes?: string;
  bgColor?: string;
}

export interface PresentationData {
  title: string;
  aspectRatio: '16:9' | '4:3';
  slides: Slide[];
}

// Invoice Data Types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

export interface InvoiceData {
  docType: 'Invoice' | 'Receipt' | 'Quotation' | 'Estimate' | 'Simple Bill';
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  businessTaxId?: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  items: InvoiceItem[];
  notes: string;
  paymentDetails: string;
}

// Template Data Types
export interface Template {
  id: string;
  title: string;
  description: string;
  category: 'school' | 'business' | 'reports' | 'letters' | 'certificates' | 'presentation' | 'spreadsheet' | 'bills';
  type: FileType;
  content?: string;
  data?: any;
  isCustom?: boolean;
}

// OpenRouter Model Definition
export interface AIModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  supportsVision?: boolean;
  isFree?: boolean;
}

// AI Request Response Types
export interface StructuredAIResponse {
  type: FileType;
  title: string;
  content?: string;
  data?: any;
  summary?: string;
  explanation?: string;
}
