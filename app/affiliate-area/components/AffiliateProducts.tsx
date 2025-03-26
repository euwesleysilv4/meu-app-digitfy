'use client';

import React, { useState, useEffect } from 'react';
import { AffiliateProduct, affiliateProductService } from '../../services/affiliateProductService';
import { ExternalLink, Gift, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AffiliateProducts() {
  // Estados
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await affiliateProductService.listActiveProducts();
        
        if (error) {
          console.error('Erro ao buscar produtos:', error);
          setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
        } else {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Ocorreu um erro ao carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="mt-8 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-red-800">Erro ao carregar produtos</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar mensagem se não houver produtos
  if (products.length === 0) {
    return (
      <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <Gift className="text-amber-500 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-amber-800">Nenhum produto disponível</h3>
            <p className="text-amber-700">No momento não há produtos disponíveis para afiliados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Produtos Disponíveis para Divulgação
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Imagem do produto */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <Gift size={48} className="text-gray-400" />
                </div>
              )}
              
              {/* Badge de destaque */}
              {product.featured && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                  Destaque
                </div>
              )}
            </div>
            
            {/* Conteúdo do produto */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              {/* Benefícios */}
              {product.benefits && product.benefits.length > 0 && (
                <ul className="mt-3 space-y-1 mb-4">
                  {product.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-emerald-500 font-bold mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                  {product.benefits.length > 3 && (
                    <li className="text-xs text-gray-500 italic pl-5">
                      +{product.benefits.length - 3} outros benefícios
                    </li>
                  )}
                </ul>
              )}
              
              {/* Preço e categoria */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-emerald-600 font-bold">{product.price_display}</span>
                <span className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-full">
                  {product.category}
                </span>
              </div>
              
              {/* Botão para acessar */}
              {product.sales_url && (
                <Link 
                  href={product.sales_url}
                  target="_blank"
                  className="mt-4 flex items-center justify-center w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <span>Acessar</span>
                  <ExternalLink size={16} className="ml-2" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 