import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Edit, 
  Trash, 
  Plus, 
  ArrowLeft,
  Save,
  Image,
  Search,
  Instagram,
  CheckCircle,
  XCircle,
  GridIcon,
  MoveUp,
  MoveDown,
  Link as LinkIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { playerService } from '../../services/playerService';
import { RecommendedPlayer } from '../../types/player';
import { supabase } from '../../lib/supabase';

const PlayersManagement: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<RecommendedPlayer[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<RecommendedPlayer | null>(null);
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
          // Carregar players
          loadPlayers();
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

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const { players, error } = await playerService.getAllPlayers();
      
      if (error) {
        console.error('Erro ao carregar players:', error);
        return;
      }
      
      setPlayers(players);
    } catch (err) {
      console.error('Erro ao carregar players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlayer = async () => {
    if (!currentPlayer) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validar campos obrigatórios
      if (!currentPlayer.name || !currentPlayer.username || !currentPlayer.image_url || !currentPlayer.category) {
        setSaveMessage('Por favor, preencha todos os campos obrigatórios.');
        setIsSaving(false);
        return;
      }
      
      let result;
      
      if (currentPlayer.id) {
        // Atualizar player existente
        result = await playerService.updatePlayer(currentPlayer.id, currentPlayer);
      } else {
        // Criar novo player
        result = await playerService.createPlayer(currentPlayer);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Recarregar lista de players
      loadPlayers();
      
      // Fechar modo de edição
      setIsEditing(false);
      setCurrentPlayer(null);
      
      setSaveMessage('Player salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar player:', err);
      setSaveMessage('Erro ao salvar player. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  const handleEditPlayer = (player: RecommendedPlayer) => {
    setCurrentPlayer({...player});
    setIsEditing(true);
  };
  
  const handleDeletePlayer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este player? Esta ação não pode ser desfeita.')) {
      try {
        const { success, error } = await playerService.deletePlayer(id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setPlayers(players.filter(player => player.id !== id));
      } catch (err) {
        console.error('Erro ao excluir player:', err);
        alert('Não foi possível excluir o player. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newPlayer: RecommendedPlayer = {
      name: '',
      username: '@',
      image_url: '',
      category: '',
      active: true,
      featured: false,
      order_index: players.length + 1
    };
    
    setCurrentPlayer(newPlayer);
    setIsEditing(true);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return; // Já está no topo
    
    try {
      const updatedPlayers = [...players];
      
      // Trocar com o item acima
      const temp = updatedPlayers[index];
      updatedPlayers[index] = updatedPlayers[index - 1];
      updatedPlayers[index - 1] = temp;
      
      // Atualizar índices
      updatedPlayers[index].order_index = index + 1;
      updatedPlayers[index - 1].order_index = index;
      
      // Atualizar a UI imediatamente
      setPlayers(updatedPlayers);
      
      // Persistir alterações na ordem no banco de dados
      const playerIds = updatedPlayers.map(player => player.id as string);
      await playerService.reorderPlayers(playerIds);
    } catch (err) {
      console.error('Erro ao reordenar players:', err);
      // Reverter em caso de erro
      loadPlayers();
    }
  };
  
  const handleMoveDown = async (index: number) => {
    if (index === players.length - 1) return; // Já está no final
    
    try {
      const updatedPlayers = [...players];
      
      // Trocar com o item abaixo
      const temp = updatedPlayers[index];
      updatedPlayers[index] = updatedPlayers[index + 1];
      updatedPlayers[index + 1] = temp;
      
      // Atualizar índices
      updatedPlayers[index].order_index = index + 1;
      updatedPlayers[index + 1].order_index = index + 2;
      
      // Atualizar a UI imediatamente
      setPlayers(updatedPlayers);
      
      // Persistir alterações na ordem no banco de dados
      const playerIds = updatedPlayers.map(player => player.id as string);
      await playerService.reorderPlayers(playerIds);
    } catch (err) {
      console.error('Erro ao reordenar players:', err);
      // Reverter em caso de erro
      loadPlayers();
    }
  };
  
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

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setIsEditing(false);
              setCurrentPlayer(null);
              setSaveMessage('');
            }}
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar para lista</span>
          </button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentPlayer?.id ? 'Editar Player' : 'Novo Player'}
              </h2>
            </div>
            
            <div className="p-6">
              {saveMessage && (
                <div className={`p-4 mb-6 rounded-lg ${saveMessage.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input 
                  type="text"
                  value={currentPlayer?.name || ''}
                  onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nome do player/influenciador"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Instagram) *</label>
                <div className="flex">
                  <div className="bg-gray-100 flex items-center pl-3 pr-2 border border-r-0 border-gray-300 rounded-l-lg">
                    <Instagram className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="text"
                    value={currentPlayer?.username || '@'}
                    onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, username: e.target.value} : null)}
                    className="flex-1 p-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="@username"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem *</label>
                <div className="flex">
                  <div className="bg-gray-100 flex items-center pl-3 pr-2 border border-r-0 border-gray-300 rounded-l-lg">
                    <Image className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="url"
                    value={currentPlayer?.image_url || ''}
                    onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, image_url: e.target.value} : null)}
                    className="flex-1 p-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                {currentPlayer?.image_url && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-200">
                      <img 
                        src={currentPlayer.image_url} 
                        alt={currentPlayer.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria/Especialidade *</label>
                <input 
                  type="text"
                  value={currentPlayer?.category || ''}
                  onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, category: e.target.value} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Marketing Digital, SEO, Tráfego Pago, etc."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea 
                  value={currentPlayer?.description || ''}
                  onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Breve descrição sobre o player"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Perfil Social (opcional)</label>
                <div className="flex">
                  <div className="bg-gray-100 flex items-center pl-3 pr-2 border border-r-0 border-gray-300 rounded-l-lg">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="url"
                    value={currentPlayer?.social_url || ''}
                    onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, social_url: e.target.value} : null)}
                    className="flex-1 p-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={currentPlayer?.active || false}
                      onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, active: e.target.checked} : null)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Se desmarcado, o player não será exibido no site
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={currentPlayer?.featured || false}
                      onChange={(e) => setCurrentPlayer(prev => prev ? {...prev, featured: e.target.checked} : null)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destaque</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Se marcado, o player receberá destaque visual
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentPlayer(null);
                    setSaveMessage('');
                  }}
                  className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleSavePlayer}
                  disabled={isSaving}
                  className={`flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-1" />
                      <span>Salvar Player</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
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
                <Users className="h-8 w-8 mr-3 text-emerald-600" />
                Players Recomendados
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie os Players/Influenciadores que recomendam a DigitFy
              </p>
            </div>
            
            <button 
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Novo Player</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Players Cadastrados
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar player..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {filteredPlayers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum player encontrado.</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-emerald-600 hover:text-emerald-700"
                    >
                      Limpar busca
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPlayers.map((player, index) => (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                              <img 
                                src={player.image_url} 
                                alt={player.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro'}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{player.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{player.username}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{player.category}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {player.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {player.featured ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300" />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="w-8 text-center">{player.order_index}</span>
                            <div className="flex flex-col ml-2">
                              <button 
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`text-gray-500 hover:text-emerald-600 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <MoveUp className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => handleMoveDown(index)}
                                disabled={index === players.length - 1}
                                className={`text-gray-500 hover:text-emerald-600 ${index === players.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <MoveDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {player.social_url && (
                              <a 
                                href={player.social_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                title="Ver perfil social"
                              >
                                <LinkIcon className="h-5 w-5" />
                              </a>
                            )}
                            <button 
                              onClick={() => handleEditPlayer(player)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                              title="Editar player"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeletePlayer(player.id as string)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Excluir player"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayersManagement; 