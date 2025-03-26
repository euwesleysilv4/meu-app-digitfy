import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho conforme necessário
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Check, 
  X, 
  ChevronDown,
  ChevronUp,
  Save,
  Loader
} from 'lucide-react';

const AdminChallengesDashboard = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [savingChanges, setSavingChanges] = useState(false);

  // Buscar desafios ao carregar o componente
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Função para buscar desafios
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vw_complete_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setChallenges(data);
    } catch (err) {
      console.error('Erro ao buscar desafios:', err);
      setError('Não foi possível carregar os desafios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar a expansão de um desafio
  const toggleChallengeExpansion = (challengeId) => {
    if (expandedChallenge === challengeId) {
      setExpandedChallenge(null);
    } else {
      setExpandedChallenge(challengeId);
    }
  };

  // Função para iniciar a edição de um desafio
  const handleEdit = (challenge) => {
    setCurrentChallenge({
      ...challenge,
      // Criar uma cópia profunda dos arrays para edição
      steps: [...challenge.steps],
      step_details: [...challenge.step_details]
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Função para iniciar a criação de um novo desafio
  const handleCreate = () => {
    setCurrentChallenge({
      id: null,
      slug: '',
      title: '',
      image_url: '',
      description: '',
      duration: '',
      difficulty: 'Iniciante',
      reward: '',
      is_active: true,
      steps: [''],
      step_details: ['']
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Função para confirmar a exclusão de um desafio
  const handleDelete = async (challengeId) => {
    if (!window.confirm('Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setSavingChanges(true);
      
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista após a exclusão
      setChallenges(challenges.filter(challenge => challenge.id !== challengeId));
      alert('Desafio excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir desafio:', err);
      alert(`Erro ao excluir desafio: ${err.message}`);
    } finally {
      setSavingChanges(false);
    }
  };

  // Função para alternar o status ativo/inativo de um desafio
  const toggleChallengeStatus = async (challenge) => {
    try {
      setSavingChanges(true);
      
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: !challenge.is_active })
        .eq('id', challenge.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar o estado localmente
      setChallenges(challenges.map(c => 
        c.id === challenge.id ? {...c, is_active: !c.is_active} : c
      ));
    } catch (err) {
      console.error('Erro ao atualizar status do desafio:', err);
      alert(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setSavingChanges(false);
    }
  };

  // Função para filtrar desafios pelo termo de busca
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar o estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Carregando painel de desafios...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-700 mb-2">Ocorreu um erro</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchChallenges}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cabeçalho */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Gerenciamento de Desafios
              </h1>
              <button
                onClick={handleCreate}
                disabled={savingChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} className="mr-2" />
                Novo Desafio
              </button>
            </div>
            
            {/* Barra de pesquisa */}
            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar desafios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          {/* Lista de desafios */}
          <div className="p-6">
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
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              challenge.difficulty === 'Iniciante' ? 'bg-green-100 text-green-800' :
                              challenge.difficulty === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {challenge.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => toggleChallengeStatus(challenge)}
                              disabled={savingChanges}
                              className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full transition-colors ${
                                challenge.is_active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {challenge.is_active ? (
                                <>
                                  <Check size={14} className="mr-1" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <X size={14} className="mr-1" />
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
                                onClick={() => handleDelete(challenge.id)}
                                disabled={savingChanges}
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
                                          {challenge.step_details[index]}
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
        </div>
      </div>

      {/* Overlay de carregamento */}
      {savingChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <Loader className="animate-spin h-6 w-6 text-blue-500 mr-3" />
            <span>Salvando alterações...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChallengesDashboard; 