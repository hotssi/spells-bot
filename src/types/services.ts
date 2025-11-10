// n8n Webhook Types
export interface N8nWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface SnippetSearchRequest {
  language?: string;
  query: string;
}

export interface SnippetSearchResult {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface ComponentSearchRequest {
  framework: string;
  category?: string;
  name?: string;
}

export interface ComponentSearchResult {
  id: string;
  name: string;
  framework: string;
  category: string;
  stackblitzUrl: string;
  description?: string;
}

export interface BackgroundSearchRequest {
  topic: string;
}

export interface BackgroundSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  url?: string;
}

// Cloudinary Types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export interface ImageProcessOptions {
  blur?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
}

// Supabase Types
export interface SupabaseQueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
}
