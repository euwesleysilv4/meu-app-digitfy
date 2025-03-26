import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
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
  Star,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Interface para os itens do Trend Rush
interface TrendRushItem {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  image_url: string | null;
  status: 'published' | 'draft' | 'archived';
  platform: 'tiktok' | 'instagram' | 'both';
  artist: string | null;
  tags: string[] | null;
  is_featured: boolean;
  view_count: number;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const TrendRushAdmin: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendRushItems, setTrendRushItems] = useState<TrendRushItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<TrendRushItem | null>(null);
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
          // Carregar itens do Trend Rush
          loadTrendRushItems();
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

  const loadTrendRushItems = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('trend_rush')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar itens do Trend Rush:', error);
        throw error;
      }
      
      setTrendRushItems(data || []);
    } catch (err) {
      console.error('Falha ao carregar itens do Trend Rush:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setTrendRushItems([
        {
          id: '1',
          title: 'Áudio em tendência 1',
          description: 'Descrição do áudio em tendência',
          audio_url: 'https://example.com/audio1.mp3',
          image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          platform: 'tiktok',
          artist: 'Artista 1',
          tags: ['viral', 'tendência'],
          is_featured: true,
          view_count: 1500,
          priority: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Áudio em tendência 2',
          description: 'Descrição do segundo áudio em tendência',
          audio_url: 'https://example.com/audio2.mp3',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          platform: 'instagram',
          artist: 'Artista 2',
          tags: ['viral', 'música'],
          is_featured: false,
          view_count: 850,
          priority: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = trendRushItems.filter(item => {
    const matchesSearch = 
      (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesSearch;
  });
  
  const handleEditItem = (item: TrendRushItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este áudio? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('trend_rush')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setTrendRushItems(trendRushItems.filter(item => item.id !== id));
        setSaveMessage('Áudio removido com sucesso!');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
        console.error('Erro ao excluir áudio:', err);
        alert('Não foi possível excluir o áudio. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newItem: TrendRushItem = {
      id: '',
      title: 'Novo Áudio',
      description: 'Descrição do áudio',
      audio_url: '',
      image_url: '',
      status: 'draft',
      platform: 'both',
      artist: '',
      tags: [],
      is_featured: false,
      view_count: 0,
      priority: trendRushItems.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setCurrentItem(newItem);
    setIsEditing(true);
  };
  
  const handleSaveItem = async () => {
    if (!currentItem) return;
    
    // Validação básica
    if (!currentItem.title.trim()) {
      alert('Por favor, insira um título para o áudio.');
      return;
    }
    
    if (!currentItem.audio_url.trim()) {
      alert('Por favor, insira a URL do áudio.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let result;
      
      if (currentItem.id) {
        // Atualizando item existente
        result = await supabase
          .from('trend_rush')
          .update({
            title: currentItem.title,
            description: currentItem.description,
            audio_url: currentItem.audio_url,
            image_url: currentItem.image_url,
            status: currentItem.status,
            platform: currentItem.platform,
            artist: currentItem.artist,
            tags: currentItem.tags,
            is_featured: currentItem.is_featured,
            priority: currentItem.priority
          })
          .eq('id', currentItem.id);
      } else {
        // Criando novo item
        result = await supabase
          .from('trend_rush')
          .insert([
            {
              title: currentItem.title,
              description: currentItem.description,
              audio_url: currentItem.audio_url,
              image_url: currentItem.image_url,
              status: currentItem.status,
              platform: currentItem.platform,
              artist: currentItem.artist,
              tags: currentItem.tags,
              is_featured: currentItem.is_featured,
              priority: currentItem.priority
            }
          ]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Atualiza estado e mostra mensagem de sucesso
      loadTrendRushItems();
      setIsEditing(false);
      setSaveMessage(currentItem.id ? 'Áudio atualizado com sucesso!' : 'Novo áudio adicionado com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar áudio:', err);
      alert('Não foi possível salvar o áudio. Tente novamente mais tarde.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Componente de formulário de edição
  const EditForm = () => {
    if (!currentItem) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {currentItem.id ? 'Editar Áudio' : 'Adicionar Novo Áudio'}
          </h2>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={currentItem.title || ''}
              onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* Artista */}
          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
              Artista
            </label>
            <input
              id="artist"
              type="text"
              value={currentItem.artist || ''}
              onChange={(e) => setCurrentItem({...currentItem, artist: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={currentItem.description || ''}
              onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* URL do Áudio */}
          <div>
            <label htmlFor="audio_url" className="block text-sm font-medium text-gray-700 mb-1">
              URL do Áudio *
            </label>
            <input
              id="audio_url"
              type="url"
              value={currentItem.audio_url || ''}
              onChange={(e) => setCurrentItem({...currentItem, audio_url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* URL da Imagem */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem
            </label>
            <input
              id="image_url"
              type="url"
              value={currentItem.image_url || ''}
              onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={currentItem.status}
              onChange={(e) => setCurrentItem({...currentItem, status: e.target.value as 'published' | 'draft' | 'archived'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          
          {/* Plataforma */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
              Plataforma
            </label>
            <select
              id="platform"
              value={currentItem.platform}
              onChange={(e) => setCurrentItem({...currentItem, platform: e.target.value as 'tiktok' | 'instagram' | 'both'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="both">Ambas</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              id="tags"
              type="text"
              value={currentItem.tags?.join(', ') || ''}
              onChange={(e) => setCurrentItem({...currentItem, tags: e.target.value.split(',').map(tag => tag.trim())})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Prioridade */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade (menor = mais importante)
            </label>
            <input
              id="priority"
              type="number"
              min="1"
              value={currentItem.priority || 1}
              onChange={(e) => setCurrentItem({...currentItem, priority: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Destaque */}
          <div className="flex items-center">
            <input
              id="is_featured"
              type="checkbox"
              checked={currentItem.is_featured || false}
              onChange={(e) => setCurrentItem({...currentItem, is_featured: e.target.checked})}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
              Destacar este áudio
            </label>
          </div>
          
          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveItem}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Se não for administrador, mostra mensagem
  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
        <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
        <p className="text-gray-600">Redirecionando para a página inicial...</p>
      </div>
    );
  }

  // Se estiver carregando, mostra indicador
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/dashboard/admin/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Music className="h-8 w-8 mr-3 text-indigo-600" />
                Gerenciamento do Trend Rush
              </h1>
              <p className="text-gray-600 mt-1">
                Adicione, edite e gerencie os áudios disponíveis na lista do Trend Rush
              </p>
            </div>
            
            <button 
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Novo Áudio</span>
            </button>
          </div>
          
          {/* Mensagem de feedback */}
          {saveMessage && (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
              {saveMessage}
            </div>
          )}
          
          {isEditing ? (
            <EditForm />
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                    Áudios do Trend Rush
                  </h2>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar áudio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum áudio encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artista</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visualizações</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="h-10 w-10 rounded-md object-cover mr-3" 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center mr-3">
                                  <Music className="h-5 w-5 text-indigo-500" />
                                </div>
                              )}
                              <div className="font-medium text-gray-900">{item.title}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.artist || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.platform === 'both' ? 'Ambas' : 
                             item.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${item.status === 'published' ? 'bg-green-100 text-green-800' : 
                                item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {item.status === 'published' ? 'Publicado' : 
                               item.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.is_featured ? (
                              <Star className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.view_count}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <a 
                                href={item.audio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                title="Ouvir áudio"
                              >
                                <Eye className="h-5 w-5" />
                              </a>
                              <button 
                                onClick={() => handleEditItem(item)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                title="Editar áudio"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                title="Remover áudio"
                              >
                                <Trash className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrendRushAdmin; 