import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Film, 
  Plus, 
  CheckSquare, 
  XSquare, 
  AlertTriangle, 
  Youtube, 
  ArrowLeft, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AffiliateVideo {
  id: string;
  titulo: string;
  descricao: string;
  youtube_id: string;
  ativo: boolean;
  data_criacao: string;
  data_modificacao: string;
}

interface FormData {
  titulo: string;
  descricao: string;
  youtube_id: string;
  ativo: boolean;
}

const AffiliateVideos: React.FC = () => {
  // Estados para gerenciar os dados e a UI
  const [videos, setVideos] = useState<AffiliateVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<AffiliateVideo | null>(null);
  
  // Estado para o formulário
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    youtube_id: '',
    ativo: true
  });
  
  const { session } = useAuth();
  
  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_specific_admin');
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(data || false);
      } catch (err) {
        console.error('Exceção ao verificar status de administrador:', err);
        setIsAdmin(false);
      }
    };
    
    if (session) {
      checkAdminStatus();
    }
  }, [session]);
  
  // Carregar vídeos do banco de dados
  const loadVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar antes se o usuário é admin
      if (!isAdmin) {
        setError('Você não tem permissão para acessar estes dados');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('affiliate_videos')
        .select('*')
        .order('data_modificacao', { ascending: false });
      
      if (error) {
        setError('Erro ao carregar vídeos de afiliados: ' + error.message);
        console.error('Erro ao carregar vídeos:', error);
      } else {
        setVideos(data || []);
      }
    } catch (err) {
      console.error('Exceção ao carregar vídeos:', err);
      setError('Erro ao carregar vídeos de afiliados');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar vídeos quando o componente for montado
  useEffect(() => {
    if (isAdmin) {
      loadVideos();
    }
  }, [isAdmin]);
  
  // Funções para o CRUD
  const handleAddVideo = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('add_affiliate_video', {
        titulo_param: formData.titulo,
        descricao_param: formData.descricao,
        youtube_id_param: formData.youtube_id
      });
      
      if (error) {
        toast.error('Erro ao adicionar vídeo: ' + error.message);
        console.error('Erro ao adicionar vídeo:', error);
        return;
      }
      
      toast.success('Vídeo adicionado com sucesso!');
      setIsCreating(false);
      resetForm();
      loadVideos();
    } catch (err) {
      console.error('Exceção ao adicionar vídeo:', err);
      toast.error('Erro ao adicionar vídeo');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('update_affiliate_video', {
        video_id: selectedVideo.id,
        titulo_param: formData.titulo,
        descricao_param: formData.descricao,
        youtube_id_param: formData.youtube_id,
        ativo_param: formData.ativo
      });
      
      if (error) {
        toast.error('Erro ao atualizar vídeo: ' + error.message);
        console.error('Erro ao atualizar vídeo:', error);
        return;
      }
      
      toast.success('Vídeo atualizado com sucesso!');
      setIsEditing(false);
      setSelectedVideo(null);
      resetForm();
      loadVideos();
    } catch (err) {
      console.error('Exceção ao atualizar vídeo:', err);
      toast.error('Erro ao atualizar vídeo');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('delete_affiliate_video', {
        video_id: id
      });
      
      if (error) {
        toast.error('Erro ao excluir vídeo: ' + error.message);
        console.error('Erro ao excluir vídeo:', error);
        return;
      }
      
      toast.success('Vídeo excluído com sucesso!');
      loadVideos();
    } catch (err) {
      console.error('Exceção ao excluir vídeo:', err);
      toast.error('Erro ao excluir vídeo');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditClick = (video: AffiliateVideo) => {
    setSelectedVideo(video);
    setFormData({
      titulo: video.titulo,
      descricao: video.descricao,
      youtube_id: video.youtube_id,
      ativo: video.ativo
    });
    setIsEditing(true);
    setIsCreating(false);
  };
  
  const handleCreateClick = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
    setSelectedVideo(null);
  };
  
  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      youtube_id: '',
      ativo: true
    });
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedVideo(null);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Renderização condicional para carregamento
  if (isLoading && !isEditing && !isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
        </div>
      </div>
    );
  }
  
  // Renderização condicional para acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md relative overflow-hidden"
        >
          <div className="text-center mb-6 relative">
            <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-gray-600 mt-2">
              Você não tem permissões para acessar o painel de administração.
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              Redirecionando para a página inicial...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Film className="text-emerald-600 mr-3" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Vídeos de Afiliados</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="flex items-center px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700">
              <ArrowLeft size={18} className="mr-2" />
              <span>Voltar</span>
            </Link>
            
            <button
              onClick={() => !isEditing && !isCreating && loadVideos()}
              className="flex items-center px-3 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-blue-700"
              disabled={isLoading || isEditing || isCreating}
            >
              <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
        
        {/* Alerta de erro */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="flex-shrink-0 mr-3" size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Botão para adicionar novo vídeo */}
        {!isEditing && !isCreating && (
          <div className="mb-6">
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Plus size={18} className="mr-2" />
              <span>Adicionar Novo Vídeo</span>
            </button>
          </div>
        )}
        
        {/* Formulário para edição ou criação */}
        {(isEditing || isCreating) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
              </h2>
              <button 
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Título do vídeo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Breve descrição do vídeo"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do YouTube
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="youtube_id"
                    value={formData.youtube_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: dQw4w9WgXcQ"
                    required
                  />
                  <Youtube size={20} className="ml-2 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O ID é a parte final da URL do YouTube (ex: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                </p>
              </div>
              
              {isEditing && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleCheckboxChange}
                      className="rounded text-emerald-600 focus:ring-emerald-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas vídeos ativos são exibidos na página de afiliados
                  </p>
                </div>
              )}
              
              {/* Prévia do vídeo */}
              {formData.youtube_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prévia do Vídeo
                  </label>
                  <div className="relative pb-[56.25%] h-0 border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${formData.youtube_id}`}
                      title={formData.titulo || "Prévia do vídeo"}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={isEditing ? handleUpdateVideo : handleAddVideo}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                  disabled={!formData.titulo || !formData.youtube_id}
                >
                  <Save size={18} className="mr-2" />
                  <span>{isEditing ? 'Salvar Alterações' : 'Adicionar Vídeo'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Lista de vídeos */}
        {!isEditing && !isCreating && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {videos.length === 0 ? (
              <div className="p-8 text-center">
                <Film size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-500">Nenhum vídeo encontrado</h3>
                <p className="text-gray-400 mt-1">Clique em "Adicionar Novo Vídeo" para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vídeo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Atualização
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                              <img 
                                src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`} 
                                alt={video.titulo} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{video.titulo}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{video.descricao}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            video.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {video.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(video.data_modificacao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditClick(video)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
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
      </div>
    </div>
  );
};

export default AffiliateVideos; 