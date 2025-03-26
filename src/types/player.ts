// Interface para os players recomendados
export interface RecommendedPlayer {
  id?: string;
  name: string;
  username: string; // @ do instagram ou outra rede social
  image_url: string; // URL da imagem do player
  category: string; // Categoria ou especialidade do player
  description?: string; // Descrição opcional do player
  order_index?: number; // Ordem de exibição no carrossel
  active?: boolean; // Se o player está ativo para exibição
  featured?: boolean; // Se o player deve ser destacado
  social_url?: string; // URL do perfil nas redes sociais
  created_at?: string;
  updated_at?: string;
} 