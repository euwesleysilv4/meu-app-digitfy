import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Link as LinkIcon,
  ImageIcon,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

// Interface do banner
interface Banner {
  id: number;
  titulo: string;
  descricao: string | null;
  imagem_desktop: string;
  imagem_mobile: string;
  url_destino: string;
  ativo: boolean;
  data_inicio: string;
  data_fim: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

const BannerManager: React.FC = () => {
  // Estados
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados do formulário
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Valores do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemDesktop, setImagemDesktop] = useState('');
  const [imagemMobile, setImagemMobile] = useState('');
  const [urlDestino, setUrlDestino] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState('');
  const [ordem, setOrdem] = useState(0);
  
  // Buscar banners do banco de dados
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('ordem', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setBanners(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar banners:', err);
      setError('Falha ao carregar banners. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar banners ao montar o componente
  useEffect(() => {
    fetchBanners();
  }, []);
  
  // Resetar formulário
  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setImagemDesktop('');
    setImagemMobile('');
    setUrlDestino('');
    setAtivo(true);
    setDataInicio(new Date().toISOString().split('T')[0]);
    setDataFim('');
    setOrdem(0);
    setCurrentBanner(null);
  };
  
  // Abrir formulário para criar
  const handleCreate = () => {
    resetForm();
    setFormMode('create');
    setShowForm(true);
  };
  
  // Abrir formulário para editar
  const handleEdit = (banner: Banner) => {
    setTitulo(banner.titulo);
    setDescricao(banner.descricao || '');
    setImagemDesktop(banner.imagem_desktop);
    setImagemMobile(banner.imagem_mobile);
    setUrlDestino(banner.url_destino);
    setAtivo(banner.ativo);
    setDataInicio(banner.data_inicio);
    setDataFim(banner.data_fim || '');
    setOrdem(banner.ordem);
    setCurrentBanner(banner);
    setFormMode('edit');
    setShowForm(true);
  };
  
  // Alternar status ativo/inativo
  const toggleActive = async (banner: Banner) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('banners')
        .update({ ativo: !banner.ativo })
        .eq('id', banner.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar localmente para evitar nova consulta
      setBanners(banners.map(b => 
        b.id === banner.id ? { ...b, ativo: !b.ativo } : b
      ));
      
      setSuccess(`Banner "${banner.titulo}" ${!banner.ativo ? 'ativado' : 'desativado'} com sucesso.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar status do banner:', err);
      setError('Falha ao atualizar status. Por favor, tente novamente.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Excluir banner
  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Tem certeza que deseja excluir o banner "${banner.titulo}"?`)) {
      return;
    }
    
    try {
      setError(null);
      
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', banner.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar localmente para evitar nova consulta
      setBanners(banners.filter(b => b.id !== banner.id));
      
      setSuccess(`Banner "${banner.titulo}" excluído com sucesso.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao excluir banner:', err);
      setError('Falha ao excluir banner. Por favor, tente novamente.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!titulo || !imagemDesktop || !imagemMobile || !urlDestino || !dataInicio) {
      setError('Preencha todos os campos obrigatórios.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setFormSubmitting(true);
      setError(null);
      
      const bannerData = {
        titulo,
        descricao: descricao || null,
        imagem_desktop: imagemDesktop,
        imagem_mobile: imagemMobile,
        url_destino: urlDestino,
        ativo,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        ordem
      };
      
      let result;
      
      if (formMode === 'create') {
        result = await supabase
          .from('banners')
          .insert([bannerData])
          .select();
      } else if (currentBanner) {
        result = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', currentBanner.id)
          .select();
      }
      
      const { error } = result || {};
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de banners
      fetchBanners();
      
      // Resetar o formulário e fechar
      resetForm();
      setShowForm(false);
      
      setSuccess(`Banner ${formMode === 'create' ? 'criado' : 'atualizado'} com sucesso.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar banner:', err);
      setError(`Falha ao ${formMode === 'create' ? 'criar' : 'atualizar'} banner. Por favor, tente novamente.`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Verificar se um banner está ativo atualmente
  const isBannerActive = (banner: Banner) => {
    if (!banner.ativo) return false;
    
    const today = new Date();
    const startDate = new Date(banner.data_inicio);
    const endDate = banner.data_fim ? new Date(banner.data_fim) : null;
    
    return startDate <= today && (!endDate || endDate >= today);
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Banners</h2>
        <button
          onClick={handleCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={18} />
          <span>Novo Banner</span>
        </button>
      </div>
      
      {/* Mensagens de feedback */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Formulário */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {formMode === 'create' ? 'Novo Banner' : 'Editar Banner'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Título do banner"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Destino <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500">
                    <LinkIcon size={18} />
                  </span>
                  <input
                    type="url"
                    value={urlDestino}
                    onChange={(e) => setUrlDestino(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://exemplo.com/pagina"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Descrição opcional do banner"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem Desktop <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500">
                    <ImageIcon size={18} />
                  </span>
                  <input
                    type="url"
                    value={imagemDesktop}
                    onChange={(e) => setImagemDesktop(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="URL da imagem para desktop"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 1200x250px
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem Mobile <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500">
                    <ImageIcon size={18} />
                  </span>
                  <input
                    type="url"
                    value={imagemMobile}
                    onChange={(e) => setImagemMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="URL da imagem para mobile"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 640x250px
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para exibir sem data limite
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Menor valor = maior prioridade
                </p>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="ativo" className="ml-2 text-sm font-medium text-gray-700">
                Banner ativo
              </label>
            </div>
            
            {/* Prévia do banner */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Prévia do Banner
              </label>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <h4 className="bg-gray-200 px-4 py-2 text-sm font-medium">Desktop</h4>
                <div className="p-4">
                  {imagemDesktop ? (
                    <div className="relative rounded-lg overflow-hidden" style={{ height: '150px' }}>
                      <img
                        src={imagemDesktop}
                        alt="Prévia do banner para desktop"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x250?text=Imagem+não+encontrada';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Insira uma URL válida para ver a prévia</span>
                    </div>
                  )}
                </div>
                
                <h4 className="bg-gray-200 px-4 py-2 text-sm font-medium">Mobile</h4>
                <div className="p-4">
                  {imagemMobile ? (
                    <div className="relative rounded-lg overflow-hidden max-w-xs mx-auto" style={{ height: '150px' }}>
                      <img
                        src={imagemMobile}
                        alt="Prévia do banner para mobile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x250?text=Imagem+não+encontrada';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center max-w-xs mx-auto">
                      <span className="text-gray-400 text-sm">Insira uma URL válida para ver a prévia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={formSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2 disabled:bg-emerald-300"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Banner</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Lista de banners */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={30} className="animate-spin text-emerald-500" />
          <span className="ml-3 text-gray-500">Carregando banners...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Info size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum banner cadastrado</h3>
          <p className="text-gray-400 mb-6">Clique no botão "Novo Banner" para começar.</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Criar Primeiro Banner</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => {
                const isActive = isBannerActive(banner);
                
                return (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0 mr-4 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={banner.imagem_desktop}
                            alt={banner.titulo}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=Erro';
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{banner.titulo}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{banner.url_destino}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(banner.data_inicio).toLocaleDateString('pt-BR')}
                      </div>
                      {banner.data_fim && (
                        <div className="text-xs text-gray-500">
                          até {new Date(banner.data_fim).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {!banner.data_fim && (
                        <div className="text-xs text-gray-500">Sem data de término</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banner.ativo && isActive
                            ? 'bg-green-100 text-green-800'
                            : banner.ativo
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {banner.ativo && isActive
                          ? 'Ativo'
                          : banner.ativo
                          ? 'Agendado'
                          : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {banner.ordem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleActive(banner)}
                          className="text-gray-400 hover:text-gray-500"
                          title={banner.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {banner.ativo ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-blue-400 hover:text-blue-500"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          className="text-red-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BannerManager; 