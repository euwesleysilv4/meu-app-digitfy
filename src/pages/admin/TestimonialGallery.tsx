import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Image, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle, 
  Search,
  Filter,
  User,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';

interface Testimonial {
  id: string;
  user_id: string;
  image_url: string;
  type: 'sale' | 'testimonial';
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  name: string | null;
  product: string | null;
  submission_message: string | null;
  notes: string | null;
  profile?: {
    nome: string;
    email: string;
  };
}

const TestimonialGallery: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'testimonial'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Usuário não autenticado, redirecionar para login
          navigate('/auth');
          return;
        }
        
        console.log('Verificando status de admin para:', user.id);
        
        // Verificar se o usuário é administrador
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        console.log('Perfil encontrado:', profile);
        
        if (profile?.role === 'admin') {
          console.log('Usuário é admin, carregando depoimentos...');
          setIsAdmin(true);
          // Carregar depoimentos apenas se for admin
          await loadTestimonials();
        } else {
          console.log('Usuário não é admin');
          setIsAdmin(false);
          // Usuário não é administrador, redirecionar
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar status de administrador:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Carregar os depoimentos
  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando depoimentos...');
      
      // Buscar todos os depoimentos
      const { data, error } = await supabase
        .from('testimonial_gallery')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('Depoimentos encontrados:', data?.length || 0);
      
      // Para cada depoimento, buscar as informações do usuário (se necessário)
      if (data && data.length > 0) {
        const testimonialWithProfiles = await Promise.all(
          data.map(async (testimonial) => {
            if (testimonial.user_id) {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('nome, email')
                  .eq('id', testimonial.user_id)
                  .single();
                
                return {
                  ...testimonial,
                  profile: profileData
                };
              } catch (err) {
                // Se não encontrar o perfil, retorna o depoimento sem profile
                return testimonial;
              }
            }
            return testimonial;
          })
        );
        
        setTestimonials(testimonialWithProfiles);
      } else {
        setTestimonials([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar depoimentos:', error.message);
      showToast('Erro ao carregar depoimentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar os depoimentos com base nos filtros atuais
  useEffect(() => {
    let filtered = [...testimonials];
    
    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Aplicar filtro de tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name?.toLowerCase().includes(searchLower) || false) ||
        (item.product?.toLowerCase().includes(searchLower) || false) ||
        (item.submission_message?.toLowerCase().includes(searchLower) || false) ||
        (item.profile?.nome?.toLowerCase().includes(searchLower) || false) ||
        (item.profile?.email?.toLowerCase().includes(searchLower) || false)
      );
    }
    
    setFilteredTestimonials(filtered);
  }, [testimonials, statusFilter, typeFilter, searchTerm]);

  // Aprovar um depoimento
  const approveTestimonial = async (id: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('approve_testimonial', { testimonial_id: id });
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      showToast('Depoimento aprovado com sucesso!', 'success');
      
      // Atualizar a lista
      await loadTestimonials();
      
      // Fechar o modal se estiver aberto
      setSelectedTestimonial(null);
    } catch (error: any) {
      console.error('Erro ao aprovar depoimento:', error.message);
      showToast('Erro ao aprovar depoimento', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Rejeitar um depoimento
  const rejectTestimonial = async (id: string, note: string = '') => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('reject_testimonial', { 
        testimonial_id: id,
        rejection_notes: note
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      showToast('Depoimento rejeitado', 'success');
      
      // Atualizar a lista
      await loadTestimonials();
      
      // Fechar o modal se estiver aberto
      setSelectedTestimonial(null);
      setRejectionNote('');
    } catch (error: any) {
      console.error('Erro ao rejeitar depoimento:', error.message);
      showToast('Erro ao rejeitar depoimento', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatar data
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

  // Modal de visualização de depoimento
  const renderTestimonialModal = () => {
    if (!selectedTestimonial) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="text-xl font-bold">
              Detalhes do Depoimento
            </h3>
            <button 
              onClick={() => {
                setSelectedTestimonial(null);
                setRejectionNote('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square w-full overflow-hidden rounded-lg border mb-4">
                  <img 
                    src={selectedTestimonial.image_url} 
                    alt="Depoimento" 
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
                
                <div className="flex justify-between gap-2">
                  <a 
                    href={selectedTestimonial.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex-1"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    <span>Ver Original</span>
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-500">Data de Envio</h4>
                  </div>
                  <p>{formatDate(selectedTestimonial.submitted_at)}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <User size={16} className="mr-2 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-500">Enviado por</h4>
                  </div>
                  <p>{selectedTestimonial.profile?.nome || 'Não informado'}</p>
                  <p className="text-sm text-gray-500">{selectedTestimonial.profile?.email || ''}</p>
                </div>
                
                {selectedTestimonial.name && (
                  <div>
                    <div className="flex items-center mb-2">
                      <User size={16} className="mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-500">Nome no Depoimento</h4>
                    </div>
                    <p>{selectedTestimonial.name}</p>
                  </div>
                )}
                
                {selectedTestimonial.product && (
                  <div>
                    <div className="flex items-center mb-2">
                      <MessageSquare size={16} className="mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-500">Produto</h4>
                    </div>
                    <p>{selectedTestimonial.product}</p>
                  </div>
                )}
                
                {selectedTestimonial.submission_message && (
                  <div>
                    <div className="flex items-center mb-2">
                      <MessageSquare size={16} className="mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-500">Mensagem</h4>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTestimonial.submission_message}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <div className="flex items-center mb-2">
                    <AlertCircle size={16} className="mr-2 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  </div>
                  <div>
                    {selectedTestimonial.status === 'pending' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                    {selectedTestimonial.status === 'approved' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aprovado
                      </span>
                    )}
                    {selectedTestimonial.status === 'rejected' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejeitado
                      </span>
                    )}
                  </div>
                </div>
                
                {(selectedTestimonial.status === 'pending') && (
                  <div className="pt-4 space-y-3">
                    <div className="w-full">
                      <label htmlFor="rejectionNote" className="block text-sm font-medium text-gray-700 mb-1">
                        Nota de rejeição (opcional):
                      </label>
                      <textarea
                        id="rejectionNote"
                        rows={3}
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        placeholder="Motivo da rejeição (se aplicável)"
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveTestimonial(selectedTestimonial.id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <>
                            <CheckCircle size={18} className="mr-2" />
                            <span>Aprovar</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => rejectTestimonial(selectedTestimonial.id, rejectionNote)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <>
                            <XCircle size={18} className="mr-2" />
                            <span>Rejeitar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  // Verificar permissão de administrador
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
      {ToastContainer}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Image className="text-emerald-600 mr-3" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Galeria de Depoimentos</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span>Voltar</span>
            </button>
            
            <button
              onClick={loadTestimonials}
              className="flex items-center px-3 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-blue-700"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
        
        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome, produto ou mensagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-md shadow-sm text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="block pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-md shadow-sm text-sm"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="sale">Vendas</option>
                  <option value="testimonial">Depoimentos</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de Depoimentos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredTestimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Image className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum depoimento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'pending' 
                  ? 'Não há depoimentos pendentes de aprovação.'
                  : 'Tente ajustar os filtros para ver mais resultados.'}
              </p>
              
              {/* Painel de depuração */}
              {isAdmin && (
                <div className="mt-8 p-4 border border-gray-300 rounded-md text-left w-full max-w-xl">
                  <h4 className="font-medium mb-2">Informações de Depuração:</h4>
                  <ul className="text-xs space-y-1">
                    <li><strong>Total de depoimentos carregados:</strong> {testimonials.length}</li>
                    <li><strong>Filtros ativos:</strong> Status: {statusFilter}, Tipo: {typeFilter}, Busca: {searchTerm || 'nenhuma'}</li>
                    <li>
                      <button 
                        onClick={async () => {
                          try {
                            const { count, error } = await supabase
                              .from('testimonial_gallery')
                              .select('*', { count: 'exact', head: true });
                              
                            if (error) throw error;
                            
                            showToast(`Total na tabela: ${count} depoimentos`, 'info');
                          } catch (err: any) {
                            showToast(`Erro ao contar: ${err.message}`, 'error');
                          }
                        }}
                        className="text-blue-500 underline"
                      >
                        Verificar contagem total na tabela
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase
                              .rpc('count_pending_testimonials');
                              
                            if (error) throw error;
                            
                            showToast(`Total pendentes: ${data} depoimentos`, 'info');
                          } catch (err: any) {
                            showToast(`Erro ao contar pendentes: ${err.message}`, 'error');
                          }
                        }}
                        className="text-blue-500 underline"
                      >
                        Verificar contagem de pendentes via RPC
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={async () => {
                          showToast('Verificando permissões na tabela...', 'info');
                          
                          try {
                            // Testar select
                            const { data: selectData, error: selectError } = await supabase
                              .from('testimonial_gallery')
                              .select('id')
                              .limit(1);
                              
                            if (selectError) {
                              showToast(`Erro no SELECT: ${selectError.message}`, 'error');
                            } else {
                              showToast(`SELECT OK: ${selectData?.length || 0} resultado(s)`, 'success');
                            }
                          } catch (err: any) {
                            showToast(`Erro de permissão: ${err.message}`, 'error');
                          }
                        }}
                        className="text-blue-500 underline"
                      >
                        Verificar permissões de acesso
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {filteredTestimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTestimonial(testimonial)}
                >
                  <div className="relative aspect-square">
                    <img 
                      src={testimonial.image_url} 
                      alt="Depoimento" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {testimonial.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      )}
                      {testimonial.status === 'approved' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Aprovado
                        </span>
                      )}
                      {testimonial.status === 'rejected' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle size={12} className="mr-1" />
                          Rejeitado
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${testimonial.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {testimonial.type === 'sale' ? 'Venda' : 'Depoimento'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {testimonial.name || testimonial.profile?.nome || 'Sem nome'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {formatDate(testimonial.submitted_at)}
                        </p>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTestimonial(testimonial);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    {testimonial.product && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Produto: {testimonial.product}
                      </p>
                    )}
                    {testimonial.status === 'pending' && (
                      <div className="flex justify-between gap-1 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveTestimonial(testimonial.id);
                          }}
                          className="flex-1 flex items-center justify-center p-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Aprovar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTestimonial(testimonial);
                            setRejectionNote('');
                          }}
                          className="flex-1 flex items-center justify-center p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <XCircle size={14} className="mr-1" />
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de detalhes */}
      {renderTestimonialModal()}
    </div>
  );
};

export default TestimonialGallery; 