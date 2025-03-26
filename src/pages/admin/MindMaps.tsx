import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Map,
  Edit, 
  Trash, 
  Plus, 
  ArrowLeft,
  Save,
  Eye,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Calendar,
  Instagram
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Interface para o tipo de mapa mental
interface MindMap {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_url: string;
  status: 'published' | 'draft' | 'scheduled';
  instagram?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  view_count: number;
  like_count: number;
}

const AdminMindMaps: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<MindMap | null>(null);
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
          // Carregar mapas mentais
          loadMindMaps();
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

  const loadMindMaps = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar mapas mentais:', error);
        throw error;
      }
      
      setMindMaps(data || []);
    } catch (err) {
      console.error('Falha ao carregar mapas mentais:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setMindMaps([
        {
          id: '1',
          title: 'Mapa Mental de Marketing Digital',
          description: 'Estratégias essenciais para o sucesso no marketing digital.',
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
          file_url: 'https://digitalfy.com/mapas/marketing-digital.pdf',
          status: 'published',
          instagram: '@marketingexpert',
          created_at: '2023-03-10T14:30:00',
          updated_at: '2023-03-15T10:45:00',
          view_count: 120,
          like_count: 45
        },
        {
          id: '2',
          title: 'Mapa Mental de Produtividade',
          description: 'Técnicas para aumentar a produtividade no dia a dia.',
          image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe',
          file_url: 'https://digitalfy.com/mapas/produtividade.pdf',
          status: 'published',
          created_at: '2023-03-05T09:15:00',
          updated_at: '2023-03-20T16:20:00',
          view_count: 85,
          like_count: 32
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMindMaps = mindMaps.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.instagram && item.instagram.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  const handleEditItem = (item: MindMap) => {
    setCurrentItem(item);
    setIsEditing(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este mapa mental? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('mind_maps')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setMindMaps(mindMaps.filter(item => item.id !== id));
      } catch (err) {
        console.error('Erro ao excluir mapa mental:', err);
        alert('Não foi possível excluir o mapa mental. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newItem: MindMap = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Novo Mapa Mental',
      description: 'Breve descrição do mapa mental',
      image_url: '',
      file_url: '',
      status: 'draft',
      instagram: '',
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
      if (!currentItem.title || !currentItem.description || !currentItem.file_url) {
        throw new Error('Por favor, preencha pelo menos título, descrição e URL do arquivo');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewItem = !mindMaps.some(item => item.id === currentItem.id);
      
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
        console.log('Criando novo mapa mental...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...itemWithoutId } = updatedItem;
        if (!id) {
          result = await supabase
            .from('mind_maps')
            .insert([itemWithoutId]);
        } else {
          result = await supabase
            .from('mind_maps')
            .insert([updatedItem]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando mapa mental existente...');
        result = await supabase
          .from('mind_maps')
          .update(updatedItem)
          .eq('id', currentItem.id);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Recarregar a lista de mapas mentais após o sucesso
      loadMindMaps();
      setIsEditing(false);
      setSaveMessage('Mapa mental salvo com sucesso!');
      
    } catch (err) {
      console.error('Erro ao salvar mapa mental:', err);
      if (err instanceof Error) {
        setSaveMessage(`Erro: ${err.message}`);
      } else {
        setSaveMessage('Ocorreu um erro ao salvar o mapa mental.');
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
          <h1 className="text-2xl font-bold">Gerenciamento de Mapas Mentais</h1>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>Adicionar Mapa Mental</span>
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 mb-4 rounded-lg ${saveMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {saveMessage}
        </div>
      )}
      
      {isEditing ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{currentItem?.id ? 'Editar' : 'Adicionar'} Mapa Mental</h2>
          
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (opcional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Instagram className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    value={currentItem?.instagram || ''} 
                    onChange={(e) => setCurrentItem(prev => prev ? {...prev, instagram: e.target.value} : null)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="@usuario"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Arquivo</label>
                <input 
                  type="text" 
                  value={currentItem?.file_url || ''} 
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, file_url: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                placeholder="Buscar mapas mentais..."
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
                  {filteredMindMaps.length > 0 ? (
                    filteredMindMaps.map((item) => (
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
                                    e.currentTarget.src = 'https://via.placeholder.com/40?text=MM';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
                                  <Map className="h-6 w-6 text-emerald-600" />
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
                              href={item.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Visualizar Arquivo"
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
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'Nenhum mapa mental encontrado com os filtros aplicados.' : 'Nenhum mapa mental cadastrado ainda.'}
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

export default AdminMindMaps; 