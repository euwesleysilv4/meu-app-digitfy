export interface ProductBenefit {
  [key: number]: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  benefits: string[];
  price: string;
  rating: number;
  image: string;
  imageUrl?: string;
  category: string;
  eliteBadge?: boolean;
  topPick?: boolean;
  url?: string;
  productUrl?: string;
  salesUrl?: string;
  is_featured?: boolean;
} 