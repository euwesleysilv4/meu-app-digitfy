// Tipos para gerenciamento de conteúdo

export interface RelevantContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  external_url?: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
  updated_at: string;
  author: string;
  tags?: string[];
  view_count: number;
  like_count: number;
  created_by?: string;
} 