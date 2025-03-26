import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Search, 
  RefreshCw,
  ArrowRight,
  BookOpen,
  ShoppingCart
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SalesStrategy {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  status: string;
  category?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
}

const SalesStrategy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [salesStrategies, setSalesStrategies] = useState<SalesStrategy[]>([]);
  const [currentStrategy, setCurrentStrategy] = useState<SalesStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStrategies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Se temos um ID, busca a estratégia específica
        if (id) {
          const { data, error } = await supabase
            .from('sales_strategies')
            .select('*')
            .eq('id', id)
            .eq('status', 'published')
            .single();
            
          if (error) throw error;
          
          if (data) {
            setCurrentStrategy(data);
            // Incrementar contador de visualizações
            await incrementViewCount(id);
          } else {
            setError('Estratégia de vendas não encontrada');
          }
        } 
        // Caso contrário, busca todas as estratégias publicadas
        else {
          const { data, error } = await supabase
            .from('sales_strategies')
            .select('*')
            .eq('status', 'published')
            .order('updated_at', { ascending: false });
            
          if (error) throw error;
          
          setSalesStrategies(data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar estratégias de vendas:', err);
        setError('Não foi possível carregar as estratégias de vendas. Tente novamente mais tarde.');
        
        // Dados de exemplo em caso de falha
        if (!id) {
          setSalesStrategies([
            {
              id: '1',
              title: 'Estratégia de Vendas Consultivas',
              description: 'Como aumentar as conversões com uma abordagem consultiva',
              content: '<p>Conteúdo detalhado sobre vendas consultivas...</p>',
              image_url: 'https://images.unsplash.com/photo-1552581234-26160f608093',
              status: 'published',
              category: 'consultiva',
              created_at: '2023-03-10T14:30:00',
              updated_at: '2023-03-15T10:45:00',
              view_count: 150,
              like_count: 48
            },
            {
              id: '2',
              title: 'Vendas por Valor',
              description: 'Método para vender destacando o valor em vez do preço',
              content: '<p>Conteúdo detalhado sobre vendas por valor...</p>',
              image_url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d',
              status: 'published',
              category: 'valor',
              created_at: '2023-03-05T09:15:00',
              updated_at: '2023-03-20T16:20:00',
              view_count: 120,
              like_count: 35
            }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStrategies();
  }, [id]);
  
  const incrementViewCount = async (strategyId: string) => {
    try {
      // Primeiro, obtenha o valor atual de view_count
      const { data, error } = await supabase
        .from('sales_strategies')
        .select('view_count')
        .eq('id', strategyId)
        .single();
        
      if (error) throw error;
      
      const newViewCount = (data?.view_count || 0) + 1;
      
      // Atualize o view_count
      const { error: updateError } = await supabase
        .from('sales_strategies')
        .update({ view_count: newViewCount })
        .eq('id', strategyId);
        
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erro ao incrementar visualizações:', err);
    }
  };
  
  // Exibe uma estratégia específica
  if (id && currentStrategy) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link 
          to="/estrategias-vendas"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
          <span>Voltar para todas as estratégias</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {currentStrategy.image_url && (
            <div className="w-full h-64 overflow-hidden">
              <img 
                src={currentStrategy.image_url}
                alt={currentStrategy.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x300?text=Estratégia+de+Vendas';
                }}
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="mb-2">
              {currentStrategy.category && (
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {currentStrategy.category === 'consultiva' ? 'Venda Consultiva' : 
                   currentStrategy.category === 'valor' ? 'Venda por Valor' : 
                   currentStrategy.category}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentStrategy.title}</h1>
            
            <div className="mb-6 text-gray-600">
              {currentStrategy.description}
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentStrategy.content }}
            />
            
            <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-4">Visualizações: {currentStrategy.view_count}</span>
              </div>
              
              <div>
                Atualizado em {new Date(currentStrategy.updated_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Exibe a lista de todas as estratégias
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <DollarSign className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Estratégias de Vendas
              </h1>
              <p className="text-gray-600 mt-1">
                Aprenda técnicas eficazes para aumentar suas vendas e conversões
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <p className="mt-4 text-gray-600">Carregando estratégias de vendas...</p>
          </div>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Sem estratégias disponíveis */}
      {!isLoading && salesStrategies.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhuma estratégia de vendas disponível</h3>
          <p className="text-gray-500">Volte em breve para conferir nosso conteúdo sobre vendas!</p>
        </div>
      )}
      
      {/* Lista de estratégias */}
      {!isLoading && salesStrategies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salesStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
            >
              {strategy.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={strategy.image_url} 
                    alt={strategy.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Estratégia+de+Vendas';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <DollarSign className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                {strategy.category && (
                  <div className="mb-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {strategy.category === 'consultiva' ? 'Venda Consultiva' : 
                       strategy.category === 'valor' ? 'Venda por Valor' : 
                       strategy.category}
                    </span>
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">{strategy.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{strategy.description}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {strategy.view_count} visualizações
                  </div>
                  
                  <Link
                    to={`/estrategias-vendas/${strategy.id}`}
                    className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <span>Ler mais</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesStrategy; 