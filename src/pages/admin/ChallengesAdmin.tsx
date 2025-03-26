import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { userService } from '../../services/userService';
import { 
  ArrowLeft, 
  Plus, 
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Flame,
  BookOpen,
  Clock,
  Star
} from 'lucide-react';
import { ChallengeForm, Toast } from '../../components/admin';

// Defina a interface do desafio com base nas tabelas do banco de dados
interface Challenge {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  reward: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: string[];
  step_details: string[];
}

const ChallengesAdmin: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{visible: boolean, message: string, type: 'success' | 'error'}>({
    visible: false, 
    message: '', 
    type: 'success'
  });
  const navigate = useNavigate();

  // Verificar se o usuário é administrador
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
          // Carregar desafios
          loadChallenges();
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

  // Carregar desafios do Supabase
  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_complete_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar desafios:', error);
        return;
      }

      setChallenges(data || []);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    }
  };

  // Função para alternar a expansão de um desafio
  const toggleChallengeExpansion = (challengeId: string) => {
    if (expandedChallenge === challengeId) {
      setExpandedChallenge(null);
    } else {
      setExpandedChallenge(challengeId);
    }
  };

  // Função para abrir o formulário de edição
  const handleEdit = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Função para abrir o formulário de criação
  const handleCreate = () => {
    setCurrentChallenge(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // Função para fechar o formulário
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Função para lidar com o sucesso da operação
  const handleSuccess = (message: string) => {
    setToast({
      visible: true,
      message,
      type: 'success'
    });
    
    // Esconder toast após 3 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
    
    // Recarregar desafios
    loadChallenges();
    
    // Fechar formulário
    setIsFormOpen(false);
  };

  // Toggle o status do desafio (ativo/inativo)
  const toggleChallengeStatus = async (challenge: Challenge) => {
    try {
      // Usar a função RPC segura para alternar o status
      const { error } = await supabase.rpc('toggle_challenge_status', {
        challenge_id: challenge.id
      });
      
      if (error) {
        console.error('Erro ao atualizar status do desafio:', error);
        
        // Solução para o erro de permissão
        if (error.message && error.message.includes('permission denied')) {
          // Mostrar toast com mensagem explicativa
          setToast({
            message: 'Erro de permissão. Verifique se a função RPC toggle_challenge_status foi criada no Supabase.',
            type: 'error',
            visible: true
          });
          
          return;
        }

        // Outros erros
        setToast({
          message: `Erro ao atualizar status: ${error.message}`,
          type: 'error',
          visible: true
        });
        return;
      }
      
      // Atualizar a lista de desafios
      loadChallenges();
      
      // Mostrar toast de sucesso
      setToast({
        message: `Desafio ${challenge.title} ${!challenge.is_active ? 'ativado' : 'desativado'} com sucesso!`,
        type: 'success',
        visible: true
      });
    } catch (err) {
      console.error('Erro ao atualizar status do desafio:', err);
      setToast({
        message: `Erro ao atualizar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        type: 'error',
        visible: true
      });
    }
  };

  // Função para deletar um desafio
  const deleteChallenge = async (challenge: Challenge) => {
    if (!confirm(`Tem certeza que deseja excluir o desafio "${challenge.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Usar a função RPC segura para excluir o desafio completo
      const { error } = await supabase.rpc('delete_complete_challenge', {
        challenge_id: challenge.id
      });
      
      if (error) {
        console.error('Erro ao excluir desafio:', error);
        
        // Solução para o erro de permissão
        if (error.message && error.message.includes('permission denied')) {
          setToast({
            message: 'Erro de permissão ao excluir desafio. Verifique se a função RPC delete_complete_challenge foi criada no Supabase.',
            type: 'error',
            visible: true
          });
          return;
        }
        
        setToast({
          message: `Erro ao excluir desafio: ${error.message}`,
          type: 'error',
          visible: true
        });
        return;
      }
      
      // Atualizar a lista de desafios
      loadChallenges();
      
      setToast({
        message: `Desafio "${challenge.title}" excluído com sucesso!`,
        type: 'success',
        visible: true
      });
    } catch (err) {
      console.error('Erro ao excluir desafio:', err);
      setToast({
        message: `Erro ao excluir desafio: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        type: 'error',
        visible: true
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para filtrar desafios
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para exibir a cor com base na dificuldade
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Estado de carregamento
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

  // Se não for administrador, mostra mensagem de acesso restrito
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
      {/* Toast para notificações */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/dashboard/admin/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Flame className="h-8 w-8 mr-3 text-emerald-600" />
                Gerenciamento de Desafios
              </h1>
              <p className="text-gray-600 mt-1">
                Crie, edite e gerencie os desafios na seção "Aprenda Aqui"
              </p>
            </div>
            
            <button 
              onClick={handleCreate}
              disabled={isDeleting}
              className="mt-4 sm:mt-0 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Novo Desafio</span>
            </button>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar desafios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          
          {/* Lista de desafios */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Nenhum desafio encontrado com os critérios de busca.' : 'Nenhum desafio cadastrado.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desafio
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duração
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dificuldade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredChallenges.map((challenge) => (
                      <React.Fragment key={challenge.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={challenge.image_url} 
                                  alt={challenge.title} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                                <div className="text-sm text-gray-500">Slug: {challenge.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{challenge.duration}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => toggleChallengeStatus(challenge)}
                              disabled={isDeleting}
                              className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full transition-colors ${
                                challenge.is_active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {challenge.is_active ? (
                                <>
                                  <CheckCircle size={14} className="mr-1" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} className="mr-1" />
                                  Inativo
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleChallengeExpansion(challenge.id)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                              >
                                {expandedChallenge === challenge.id ? (
                                  <ChevronUp size={18} />
                                ) : (
                                  <ChevronDown size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(challenge)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => deleteChallenge(challenge)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Detalhes do desafio */}
                        {expandedChallenge === challenge.id && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm">
                                <div className="mb-4">
                                  <h3 className="font-semibold text-gray-700 mb-2">Descrição:</h3>
                                  <p className="text-gray-600">{challenge.description}</p>
                                </div>
                                
                                <div className="mb-4">
                                  <h3 className="font-semibold text-gray-700 mb-2">Recompensa:</h3>
                                  <p className="text-gray-600">{challenge.reward}</p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-700 mb-2">Etapas:</h3>
                                  <div className="space-y-4">
                                    {challenge.steps.map((step, index) => (
                                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="font-medium text-gray-800 mb-2">
                                          {index + 1}. {step}
                                        </h4>
                                        <p className="text-gray-600 text-sm">
                                          {challenge.step_details[index] || 'Sem detalhes'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Formulário de edição/criação */}
      {isFormOpen && (
        <ChallengeForm
          challenge={currentChallenge}
          isEditing={isEditing}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ChallengesAdmin; 