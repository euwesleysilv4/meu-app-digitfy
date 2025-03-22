export interface ProductBenefit {
  [key: number]: string;
}

export interface Product {
  name: string;
  description: string;
  benefits: string[];
  price: string;
  rating: number;
  image: string;
  category: string;
  eliteBadge?: boolean;
  topPick?: boolean;
} 