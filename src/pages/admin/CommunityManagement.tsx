import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Check, X, Eye, Search, Filter, RefreshCw, MessageSquare, Disc, Send, Image, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

interface Community {
  id: string;
  community_name: string;
  description: string;
  link: string;
  category: string;
  members_count: number;
  contact_email: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  image_url?: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  communityName: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, communityName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirmar Remoção
          </h3>
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja remover a comunidade <span className="font-medium">"{communityName}"</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, communityName }) => {
  if (!isOpen) return null;

  // Fechar automaticamente após 2 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="bg-emerald-100 p-3 rounded-full mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Comunidade Removida
          </h3>
          <p className="text-gray-600">
            A comunidade <span className="font-medium">"{communityName}"</span> foi removida com sucesso.
          </p>
        </div>
      </div>
    </div>
  );
};

const CommunityManagement: React.FC = () => {
  const { session } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'WhatsApp' | 'Discord' | 'Telegram'>('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    communityId: string;
    communityName: string;
  }>({
    isOpen: false,
    communityId: '',
    communityName: ''
  });
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    communityName: string;
  }>({
    isOpen: false,
    communityName: ''
  });

  useEffect(() => {
    if (!session) return;
    
    fetchCommunities();
  }, [session, filter, typeFilter]);
  
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('submitted_communities')
        .select('*');
      
      // Aplicar filtros
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      if (typeFilter !== 'all') {
        // Converter o tipo para minúsculas para corresponder ao enum do banco de dados
        const dbType = typeFilter.toLowerCase();
        query = query.eq('type', dbType);
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Converter os tipos do banco de dados para os tipos de exibição
      const formattedData = (data || []).map(item => ({
        ...item,
        type: formatCommunityType(item.type)
      }));
      
      setCommunities(formattedData as Community[]);
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
      toast.error('Não foi possível carregar as comunidades.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para formatar o tipo da comunidade para exibição
  const formatCommunityType = (type: string): string => {
    switch (type) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'discord':
        return 'Discord';
      case 'telegram':
        return 'Telegram';
      default:
        return type;
    }
  };
  
  const approveCommunity = async (id: string) => {
    try {
      if (!session) {
        toast.error('Você precisa estar logado para aprovar comunidades');
        return;
      }

      console.log('Tentando aprovar comunidade com ID:', id);

      const { data, error } = await supabase
        .rpc('approve_community', {
          p_community_id: id
        });

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Detalhes do erro:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao aprovar comunidade');
      }

      toast.success('Comunidade aprovada com sucesso!');
      fetchCommunities();
    } catch (error) {
      console.error('Erro ao aprovar comunidade:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao aprovar comunidade: ${error.message}`);
      } else {
        toast.error('Não foi possível aprovar a comunidade.');
      }
    }
  };
  
  const rejectCommunity = async (id: string) => {
    try {
      if (!session) {
        toast.error('Você precisa estar logado para rejeitar comunidades');
        return;
      }

      const { data, error } = await supabase.rpc('reject_community', {
        p_community_id: id
      });

      if (error) {
        console.error('Detalhes do erro:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao rejeitar comunidade');
      }

      toast.success('Comunidade rejeitada com sucesso!');
      fetchCommunities();
    } catch (error) {
      console.error('Erro ao rejeitar comunidade:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao rejeitar comunidade: ${error.message}`);
      } else {
        toast.error('Não foi possível rejeitar a comunidade.');
      }
    }
  };

  const removeCommunity = async (id: string) => {
    try {
      if (!session) {
        toast.error('Você precisa estar logado para remover comunidades');
        return;
      }

      const { success, error } = await userService.removeCommunity(id);

      if (error) {
        throw error;
      }

      toast.success('Comunidade removida com sucesso!');
      fetchCommunities();
    } catch (error) {
      console.error('Erro ao remover comunidade:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao remover comunidade: ${error.message}`);
      } else {
        toast.error('Não foi possível remover a comunidade.');
      }
    }
  };

  // Filtragem baseada no termo de busca
  const filteredCommunities = communities.filter(community => {
    // Se não há termo de busca, retorna verdadeiro (inclui a comunidade)
    if (!searchTerm.trim()) return true;
    
    // Verifica se o termo de busca está presente em várias propriedades
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      community.community_name.toLowerCase().includes(searchTermLower) ||
      community.description.toLowerCase().includes(searchTermLower) ||
      community.category.toLowerCase().includes(searchTermLower) ||
      community.type.toLowerCase().includes(searchTermLower) ||
      community.status.toLowerCase().includes(searchTermLower)
    );
  });

  // Função para obter os estilos de status
  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDelete = (community: Community) => {
    setDeleteModal({
      isOpen: true,
      communityId: community.id,
      communityName: community.community_name
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await removeCommunity(deleteModal.communityId);
      setDeleteModal({ isOpen: false, communityId: '', communityName: '' });
      // Mostrar modal de sucesso
      setSuccessModal({
        isOpen: true,
        communityName: deleteModal.communityName
      });
    } catch (error) {
      console.error('Erro ao remover comunidade:', error);
      toast.error('Não foi possível remover a comunidade.');
    }
  };

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, communityId: '', communityName: '' });
  };

  const handleCloseSuccessModal = () => {
    setSuccessModal({ isOpen: false, communityName: '' });
  };

  const renderCommunityRow = (community: Community) => {
    return (
      <tr key={community.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 border-b">
          <div className="flex items-center space-x-3">
            {community.image_url ? (
              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={community.image_url} 
                  alt={community.community_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback para ícone em caso de erro na imagem
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling instanceof HTMLElement) {
                      target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="h-10 w-10 bg-gray-100 rounded-full items-center justify-center hidden">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Image className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{community.community_name}</div>
              <div className="text-gray-500 text-sm truncate max-w-xs">{community.description}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 border-b">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {community.category}
          </span>
        </td>
        <td className="px-4 py-3 border-b">
          <div className="flex items-center">
            {getCommunityTypeIcon(community.type)}
            <span className="ml-1">{community.type}</span>
          </div>
        </td>
        <td className="px-4 py-3 border-b text-center">{community.members_count}</td>
        <td className="px-4 py-3 border-b">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(community.status)}`}>
            {community.status}
          </span>
        </td>
        <td className="px-4 py-3 border-b">
          {new Date(community.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td className="px-4 py-3 border-b">
          <div className="flex items-center space-x-2">
            <a 
              href={community.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye size={18} />
            </a>
            {community.status === 'pending' && (
              <>
                <button
                  onClick={() => approveCommunity(community.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => rejectCommunity(community.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={18} />
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(community)}
              className="text-red-600 hover:text-red-800"
              title="Remover comunidade"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Função para exibir o ícone de cada tipo de comunidade
  const getCommunityTypeIcon = (type: string) => {
    switch (type) {
      case 'WhatsApp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'Discord':
        return <Disc className="h-4 w-4 text-indigo-600" />;
      case 'Telegram':
        return <Send className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Gerenciamento de Comunidades</h1>
        <p className="text-gray-600">
          Gerencie as comunidades enviadas pelos usuários para divulgação.
        </p>
      </div>
      
      {/* Filtros e busca */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'approved'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Aprovadas
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Rejeitadas
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Discord">Discord</option>
              <option value="Telegram">Telegram</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar comunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 pr-10 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            <button
              onClick={fetchCommunities}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Estado de carregamento */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}
      
      {/* Tabela de comunidades */}
      {!loading && filteredCommunities.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comunidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membros
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommunities.map(community => renderCommunityRow(community))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Mensagem de nenhuma comunidade encontrada */}
      {!loading && filteredCommunities.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Filter className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma comunidade encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não existem comunidades {filter !== 'all' ? `${filter}s` : ''} no momento.
          </p>
        </div>
      )}
      
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        communityName={deleteModal.communityName}
      />
      
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseSuccessModal}
        communityName={successModal.communityName}
      />
    </div>
  );
};

// Adicione estes estilos no seu arquivo CSS global ou como uma tag style
const styles = `
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
`;

export default CommunityManagement; 