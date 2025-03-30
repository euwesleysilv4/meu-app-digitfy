import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  BookOpen, 
  Edit, 
  Trash, 
  Plus, 
  ArrowLeft,
  Save,
  Eye,
  Search,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Interface para o tipo de estratégia de vendas
interface SalesStrategy {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  status: 'published' | 'draft' | 'scheduled';
  category?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  view_count: number;
  like_count: number;
}

const AdminSalesStrategies: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [salesStrategies, setSalesStrategies] = useState<SalesStrategy[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<SalesStrategy | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // Carregar estratégias de vendas
          loadSalesStrategies();
        }
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const loadSalesStrategies = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('sales_strategies')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar estratégias de vendas:', error);
        throw error;
      }
      
      setSalesStrategies(data || []);
    } catch (err) {
      console.error('Falha ao carregar estratégias de vendas:', err);
      
      // Dados de exemplo em caso de falha no carregamento
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
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStrategies = salesStrategies.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  const handleEditItem = (item: SalesStrategy) => {
    setCurrentItem(item);
    setIsEditing(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta estratégia de vendas? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('sales_strategies')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setSalesStrategies(salesStrategies.filter(item => item.id !== id));
      } catch (err) {
        console.error('Erro ao excluir estratégia de vendas:', err);
        alert('Não foi possível excluir a estratégia de vendas. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newItem: SalesStrategy = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Nova Estratégia de Vendas',
      description: 'Breve descrição da estratégia',
      content: '',
      image_url: '',
      status: 'draft',
      category: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      like_count: 0
    };
    
    setCurrentItem(newItem);
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!currentItem) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validação básica
      if (!currentItem.title || !currentItem.description || !currentItem.content) {
        throw new Error('Por favor, preencha pelo menos título, descrição e conteúdo');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewItem = !salesStrategies.some(item => item.id === currentItem.id);
      
      // Atualizar o timestamp e adicionar o userId como created_by
      const updatedItem = {
        ...currentItem,
        updated_at: new Date().toISOString(),
        created_by: userId // Adicionar o ID do usuário atual
      };
      
      // Para debugging - mostrar os dados que serão enviados
      console.log('Dados a serem enviados:', updatedItem);
      
      let result;
      
      if (isNewItem) {
        // Inserir novo registro
        console.log('Criando nova estratégia de vendas...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...itemWithoutId } = updatedItem;
        if (!id) {
          result = await supabase
            .from('sales_strategies')
            .insert([itemWithoutId]);
        } else {
          result = await supabase
            .from('sales_strategies')
            .insert([updatedItem]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando estratégia de vendas existente...');
        result = await supabase
          .from('sales_strategies')
          .update(updatedItem)
          .eq('id', currentItem.id);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Recarregar a lista de estratégias de vendas após o sucesso
      loadSalesStrategies();
      setIsEditing(false);
      setSaveMessage('Estratégia de vendas salva com sucesso!');
      
    } catch (err) {
      console.error('Erro ao salvar estratégia de vendas:', err);
      if (err instanceof Error) {
        setSaveMessage(`Erro: ${err.message}`);
      } else {
        setSaveMessage('Ocorreu um erro ao salvar a estratégia de vendas.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return dateString;
    }
  };

  const getCategoryDisplay = (category?: string) => {
    if (!category) return "Geral";
    
    switch (category.toLowerCase()) {
      case 'consultiva':
        return "Venda Consultiva";
      case 'valor':
        return "Venda por Valor";
      default:
        return category;
    }
  };

  // Se estiver verificando permissões
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <p className="mt-4 text-gray-600">Verificando permissões e carregando dados...</p>
        </div>
      </div>
    );
  }

  // Se não for admin
  if (!isAdmin) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
          <p className="text-gray-600">Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/dashboard" className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">Gerenciamento de Estratégias de Vendas</h1>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>Adicionar Estratégia</span>
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 mb-4 rounded-lg ${saveMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {saveMessage}
        </div>
      )}
      
      {isEditing ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{currentItem?.id ? 'Editar' : 'Adicionar'} Estratégia de Vendas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={currentItem?.title || ''} 
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  value={currentItem?.description || ''} 
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input 
                  type="text" 
                  value={currentItem?.image_url || ''} 
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, image_url: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  value={currentItem?.category || ''} 
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, category: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="consultiva">Venda Consultiva</option>
                  <option value="valor">Venda por Valor</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={currentItem?.status || 'draft'} 
                  onChange={(e) => setCurrentItem(prev => prev ? {
                    ...prev, 
                    status: e.target.value as 'published' | 'draft' | 'scheduled'
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Editor de conteúdo Rich Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <div className="min-h-[300px] border border-gray-300 rounded-md">
                  <ReactQuill 
                    theme="snow" 
                    value={currentItem?.content || ''} 
                    onChange={(content: string) => setCurrentItem(prev => prev ? {...prev, content} : null)}
                    style={{ height: '250px' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                  />
                </div>
              </div>
              
              {/* Pré-visualização da imagem */}
              {currentItem?.image_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pré-visualização da Imagem</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden h-40 bg-gray-100">
                    <img 
                      src={currentItem.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagem+Inválida';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveContent} 
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar estratégias de vendas..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visualizações
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStrategies.length > 0 ? (
                    filteredStrategies.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.image_url ? (
                                <img 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={item.image_url} 
                                  alt={item.title}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/40?text=SV';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
                                  <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getCategoryDisplay(item.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'published' ? 'bg-green-100 text-green-800' : 
                            item.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status === 'published' ? 'Publicado' : 
                             item.status === 'draft' ? 'Rascunho' : 'Agendado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.view_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <a 
                              href={`/dashboard/learning/sales-strategy/${item.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Visualizar"
                            >
                              <Eye className="h-5 w-5" />
                            </a>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'Nenhuma estratégia de vendas encontrada com os filtros aplicados.' : 'Nenhuma estratégia de vendas cadastrada ainda.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSalesStrategies; 