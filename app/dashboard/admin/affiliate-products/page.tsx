import { Metadata } from 'next';
import AffiliateProductsAdmin from './AffiliateProductsAdmin';

export const metadata: Metadata = {
  title: 'Gerenciamento de Produtos para Afiliados',
  description: 'Administre os produtos exibidos na área do afiliado',
};

export default function AffiliateProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AffiliateProductsAdmin />
    </div>
  );
} 