export type StatusNovidade = 'ativo' | 'inativo';

export interface CategoriaNovidade {
    id: number;
    nome: string;
    slug: string;
    descricao: string;
    created_at: string;
    updated_at: string;
}

export interface Novidade {
    id: number;
    titulo: string;
    slug: string;
    descricao_curta: string;
    conteudo: string;
    imagem_url?: string;
    categoria_id: number;
    status: StatusNovidade;
    data_publicacao: string;
    created_at: string;
    updated_at: string;
    categoria?: CategoriaNovidade;
}

export interface FormNovidade {
    titulo: string;
    slug: string;
    descricao_curta: string;
    conteudo: string;
    imagem_url?: string;
    categoria_id: number;
    status: StatusNovidade;
    data_publicacao: string;
} 