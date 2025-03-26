import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Pencil, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  Filter,
  EyeOff,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import VideoForm from './VideoForm';
import { supabaseClient } from '../../../utils/supabase-client';

type TutorialVideo = {
  id: string;
  titulo: string;
  descricao: string;
  youtube_id: string;
  categoria: 'introducao' | 'planos_premium' | 'ferramentas';
  ordem: number;
  ativo: boolean;
  data_criacao: string;
  data_modificacao: string;
};

const categoriasMap = {
  'introducao': 'Introdução à DigitFy',
  'planos_premium': 'Benefícios dos Planos Premium',
  'ferramentas': 'Ferramentas Avançadas'
};

const TutorialVideosPage: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<TutorialVideo | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: 'asc' | 'desc' }>({
    campo: 'categoria',
    direcao: 'asc'
  });

  // Buscar todos os vídeos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      let query = supabaseClient.from('tutorial_videos').select('*');
      
      // Aplicar filtros
      if (filtroCategoria) {
        query = query.eq('categoria', filtroCategoria);
      }
      
      if (filtroAtivo !== null) {
        query = query.eq('ativo', filtroAtivo);
      }
      
      // Aplicar ordenação
      query = query.order(ordenacao.campo, { ascending: ordenacao.direcao === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setVideos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar vídeos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos ao montar o componente ou quando os filtros mudarem
  useEffect(() => {
    fetchVideos();
  }, [filtroCategoria, filtroAtivo, ordenacao]);

  // Alternar ordenação
  const toggleOrdenacao = (campo: string) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdenacao({
        campo,
        direcao: 'asc'
      });
    }
  };

  // Excluir vídeo
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) {
      return;
    }

    try {
      const { error } = await supabaseClient.rpc('delete_tutorial_video', {
        video_id: id
      });

      if (error) {
        throw error;
      }

      // Atualizar a lista após excluir
      setVideos(videos.filter(video => video.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao excluir vídeo:', err);
    }
  };

  // Alternar status ativo/inativo
  const toggleStatus = async (video: TutorialVideo) => {
    try {
      const { error } = await supabaseClient.rpc('update_tutorial_video', {
        video_id: video.id,
        titulo_param: video.titulo,
        descricao_param: video.descricao,
        youtube_id_param: video.youtube_id,
        categoria_param: video.categoria,
        ordem_param: video.ordem,
        ativo_param: !video.ativo
      });

      if (error) {
        throw error;
      }

      // Atualizar a lista após alterar o status
      setVideos(videos.map(v => 
        v.id === video.id ? { ...v, ativo: !v.ativo } : v
      ));
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao alterar status do vídeo:', err);
    }
  };

  // Editar vídeo
  const handleEdit = (video: TutorialVideo) => {
    setCurrentVideo(video);
    setShowForm(true);
  };

  // Adicionar novo vídeo
  const handleAdd = () => {
    setCurrentVideo(null);
    setShowForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentVideo(null);
  };

  // Salvar vídeo (novo ou editado)
  const handleSaveVideo = async (video: TutorialVideo) => {
    try {
      if (currentVideo) {
        // Atualizar vídeo existente
        const { error } = await supabaseClient.rpc('update_tutorial_video', {
          video_id: currentVideo.id,
          titulo_param: video.titulo,
          descricao_param: video.descricao,
          youtube_id_param: video.youtube_id,
          categoria_param: video.categoria,
          ordem_param: video.ordem,
          ativo_param: video.ativo
        });

        if (error) {
          throw error;
        }
      } else {
        // Adicionar novo vídeo
        const { error } = await supabaseClient.rpc('add_tutorial_video', {
          titulo_param: video.titulo,
          descricao_param: video.descricao,
          youtube_id_param: video.youtube_id,
          categoria_param: video.categoria,
          ordem_param: video.ordem
        });

        if (error) {
          throw error;
        }
      }

      // Recarregar a lista e fechar o formulário
      await fetchVideos();
      handleCloseForm();
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao salvar vídeo:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-800">Gerenciamento de Vídeos Tutoriais</h1>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Vídeo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
          <AlertCircle size={24} className="mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center">
            <Filter size={18} className="text-emerald-600 mr-2" />
            <span className="text-gray-700 font-medium">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              className="border rounded-lg px-3 py-2 bg-white text-gray-700"
              value={filtroCategoria || ''}
              onChange={(e) => setFiltroCategoria(e.target.value || null)}
            >
              <option value="">Todas as categorias</option>
              <option value="introducao">Introdução à DigitFy</option>
              <option value="planos_premium">Benefícios dos Planos Premium</option>
              <option value="ferramentas">Ferramentas Avançadas</option>
            </select>
            
            <select
              className="border rounded-lg px-3 py-2 bg-white text-gray-700"
              value={filtroAtivo === null ? '' : String(filtroAtivo)}
              onChange={(e) => {
                const val = e.target.value;
                setFiltroAtivo(val === '' ? null : val === 'true');
              }}
            >
              <option value="">Todos os status</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de vídeos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando vídeos...</div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum vídeo tutorial encontrado. Clique em "Adicionar Vídeo" para criar um novo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleOrdenacao('titulo')}
                  >
                    <div className="flex items-center">
                      Título
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleOrdenacao('categoria')}
                  >
                    <div className="flex items-center">
                      Categoria
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleOrdenacao('ordem')}
                  >
                    <div className="flex items-center">
                      Ordem
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleOrdenacao('ativo')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleOrdenacao('data_modificacao')}
                  >
                    <div className="flex items-center">
                      Atualizado
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.map((video) => (
                  <tr key={video.id} className={!video.ativo ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-emerald-100 rounded-full">
                          <PlayCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{video.titulo}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{video.descricao}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {categoriasMap[video.categoria]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {video.ordem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {video.ativo ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle size={16} className="mr-1" /> Ativo
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          <EyeOff size={16} className="mr-1" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(video.data_modificacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleStatus(video)}
                          className={`inline-flex items-center justify-center p-2 rounded-md ${
                            video.ativo 
                              ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-100' 
                              : 'text-emerald-400 hover:text-emerald-500 hover:bg-emerald-100'
                          }`}
                          title={video.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {video.ativo ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(video)}
                          className="inline-flex items-center justify-center p-2 rounded-md text-blue-400 hover:text-blue-500 hover:bg-blue-100"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="inline-flex items-center justify-center p-2 rounded-md text-red-400 hover:text-red-500 hover:bg-red-100"
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

      {/* Formulário de edição/adição */}
      {showForm && (
        <VideoForm
          video={currentVideo}
          onSave={handleSaveVideo}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TutorialVideosPage; 