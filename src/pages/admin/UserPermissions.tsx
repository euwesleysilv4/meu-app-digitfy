import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Zap, 
  Database, 
  Globe, 
  Search, 
  Filter, 
  CheckCircle, 
  BadgeCheck, 
  Save,
  Clock,
  XCircle,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import type { UserProfile } from '../../lib/supabase';
import type { UserPlan, UserRole } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const UserPermissionsPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<UserPlan | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const navigate = useNavigate();

  // Verificar se o usuário é o administrador específico
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { isAdmin, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setErrorMessage('Não foi possível verificar suas permissões de administrador.');
          setIsAuthorizedAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        setIsAuthorizedAdmin(isAdmin);
        
        if (!isAdmin) {
          setErrorMessage('Acesso restrito. Apenas o administrador autorizado pode acessar esta página.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        // Se for o administrador autorizado, carregar os usuários
        fetchUsers();
        
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setErrorMessage('Ocorreu um erro ao verificar suas permissões.');
        setIsAuthorizedAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Carregar usuários do Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await userService.listAllUsers();
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        setErrorMessage('Erro ao carregar usuários. Verifique suas permissões.');
        setIsLoading(false);
        return;
      }
      
      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setErrorMessage('Erro ao carregar usuários. Verifique sua conexão com o Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuários com base na pesquisa e filtro de plano
  useEffect(() => {
    let result = users;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      result = result.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por plano
    if (filterPlan !== 'all') {
      result = result.filter(user => user.plano === filterPlan);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterPlan, users]);

  // Atualizar o plano do usuário
  const updateUserPlan = async (userId: string, newPlan: UserPlan) => {
    if (!userId || !newPlan) return;

    try {
      // Mostrar feedback visual de processamento apenas para a atualização do plano
      setIsUpdatingPlan(true);
      setErrorMessage(null);
      
      console.log('Atualizando plano para:', newPlan);
      const { success, error } = await userService.updateUserPlan(userId, newPlan);
      
      if (error) {
        console.error('Erro ao atualizar plano:', error);
        setErrorMessage(`Erro ao atualizar plano: ${error.message || 'Verifique suas permissões'}`);
        return;
      }
      
      if (success) {
        // Atualizar o estado local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, plano: newPlan } 
              : user
          )
        );
        
        // Se o usuário selecionado for o que está sendo atualizado, atualizar também
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, plano: newPlan });
        }
        
        // Mostrar mensagem de sucesso
        setShowSuccessMessage(true);
        setErrorMessage(null);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setErrorMessage('Não foi possível atualizar o plano do usuário. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao atualizar plano:', err);
      setErrorMessage('Ocorreu um erro ao atualizar o plano do usuário.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };
  
  // Forçar a atualização do plano do usuário (método alternativo para casos de erro)
  const forceUpdateUserPlan = async (userId: string, newPlan: UserPlan) => {
    if (!userId || !newPlan) return;

    try {
      // Mostrar feedback visual de processamento
      setIsUpdatingPlan(true);
      setErrorMessage(null);
      
      console.log('Forçando atualização de plano para:', newPlan);
      const { success, error } = await userService.forceUpdateUserPlan(userId, newPlan);
      
      if (error) {
        console.error('Erro ao forçar atualização do plano:', error);
        setErrorMessage(`Erro ao forçar atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        return;
      }
      
      if (success) {
        // Atualizar o estado local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, plano: newPlan } 
              : user
          )
        );
        
        // Se o usuário selecionado for o que está sendo atualizado, atualizar também
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, plano: newPlan });
        }
        
        // Mostrar mensagem de sucesso
        toast.success(`Plano do usuário atualizado com sucesso para: ${newPlan}`);
        setErrorMessage(null);
      } else {
        setErrorMessage('Não foi possível forçar a atualização do plano. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao forçar atualização do plano:', err);
      setErrorMessage('Ocorreu um erro ao forçar a atualização do plano.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // Função para banir/desbanir usuário
  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      // Mostrar feedback visual de processamento
      setIsUpdatingPlan(true);
      setErrorMessage(null);
      
      console.log(`${isBanned ? 'Banindo' : 'Desbanindo'} usuário:`, userId);
      const { success, error } = await userService.toggleUserBan(userId, isBanned);
      
      if (error) {
        console.error('Erro ao atualizar status de banimento:', error);
        setErrorMessage(`Erro ao atualizar status de banimento: ${error.message || 'Verifique suas permissões'}`);
        return;
      }
      
      if (success) {
        // Atualizar o estado local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, banido: isBanned } 
              : user
          )
        );
        
        // Se o usuário selecionado for o que está sendo atualizado, atualizar também
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, banido: isBanned });
        }
        
        // Mostrar mensagem de sucesso
        setShowSuccessMessage(true);
        setErrorMessage(null);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setErrorMessage('Não foi possível atualizar o status de banimento do usuário. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao atualizar status de banimento:', err);
      setErrorMessage('Ocorreu um erro ao atualizar o status de banimento do usuário.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // Funções para abrir e fechar o modal
  const openUserModal = (user: UserProfile) => {
    setSelectedUser(user);
    setErrorMessage(null);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setErrorMessage(null);
  };

  // Função para exibir o ícone correto do plano
  const getPlanIcon = (plan: UserPlan) => {
    switch (plan) {
      case 'gratuito':
        return <Shield className="text-emerald-500" />;
      case 'member':
        return <Zap className="text-emerald-500" />;
      case 'pro':
        return <Database className="text-green-500" />;
      case 'elite':
        return <Globe className="text-emerald-500" />;
      default:
        return <Shield className="text-emerald-500" />;
    }
  };

  // Função para obter nome do plano formatado
  const getPlanName = (plan: UserPlan) => {
    switch (plan) {
      case 'gratuito':
        return 'DigitFy Free';
      case 'member':
        return 'DigitFy Member';
      case 'pro':
        return 'DigitFy Pro';
      case 'elite':
        return 'DigitFy Elite';
      default:
        return 'DigitFy Free';
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Se não for o administrador autorizado, exibir tela de acesso negado
  if (!isAuthorizedAdmin && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center mb-6">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-gray-600 mt-2">
              {errorMessage || 'Você não tem permissões para acessar esta página. Apenas o administrador autorizado pode acessar.'}
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              Redirecionando para a página inicial...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      {/* Cabeçalho da página */}
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-lg shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Permissões de Usuários
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Gerencie os planos e permissões dos usuários da plataforma DigitFy. Altere entre os planos Free, Member, Pro e Elite para cada usuário.
          </p>
        </motion.div>

        {/* Mensagem de erro na página principal */}
        {errorMessage && !selectedUser && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            {errorMessage}
          </motion.div>
        )}

        {/* Barra de ações e filtros */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          {/* Barra de pesquisa */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtro de plano */}
          <div className="relative min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as UserPlan | 'all')}
            >
              <option value="all">Todos os planos</option>
              <option value="gratuito">DigitFy Free</option>
              <option value="member">DigitFy Member</option>
              <option value="pro">DigitFy Pro</option>
              <option value="elite">DigitFy Elite</option>
            </select>
          </div>
        </motion.div>
        
        {/* Tabela de usuários */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow overflow-hidden"
        >
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Nenhum usuário encontrado</p>
              <p className="mt-2 text-gray-400 text-sm">Tente ajustar seus filtros de busca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plano Atual
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openUserModal(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt={user.nome}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                  {user.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {user.nome}
                              </div>
                              {user.verificado && (
                                <BadgeCheck className="ml-1 h-4 w-4 text-emerald-500" />
                              )}
                              {user.role === 'admin' && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Admin
                                </span>
                              )}
                              {user.role === 'moderator' && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Moderador
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getPlanIcon(user.plano)}
                          </div>
                          <span className={`
                            ${user.plano === 'gratuito' ? 'text-emerald-600' : ''}
                            ${user.plano === 'member' ? 'text-emerald-600' : ''}
                            ${user.plano === 'pro' ? 'text-green-600' : ''}
                            ${user.plano === 'elite' ? 'text-emerald-600' : ''}
                            font-medium
                          `}>
                            {getPlanName(user.plano)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(user.data_criacao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          {formatDate(user.ultimo_login)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.banido ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Banido
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-emerald-600 hover:text-emerald-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUserModal(user);
                          }}
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal para editar permissões */}
      {selectedUser && (
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 100 }}>
          {/* Overlay acinzentado */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={closeUserModal}
          ></div>
          
          {/* Container centralizado do modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Conteúdo do modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-2xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do modal */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
                <div className="mr-3">
                  {selectedUser.avatar_url ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={selectedUser.avatar_url}
                      alt={selectedUser.nome}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 font-medium text-lg">
                        {selectedUser.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    {selectedUser.nome}
                    {selectedUser.verificado && (
                      <BadgeCheck className="ml-1 h-5 w-5 text-emerald-500" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  disabled={isUpdatingPlan}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {/* Conteúdo do modal */}
              <div className="p-6 space-y-6">
                {/* Informações do usuário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">ID do Usuário</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Função</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.data_criacao)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Último Login</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.ultimo_login)}</p>
                  </div>
                </div>

                {/* Seleção de plano */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Alterar Plano</h4>
                  
                  {/* Mensagem de erro no modal */}
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['gratuito', 'member', 'pro', 'elite'] as UserPlan[]).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        className={`
                          flex items-center p-4 rounded-lg border-2 transition-all
                          ${selectedUser.plano === plan 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 hover:border-emerald-300'}
                          ${isUpdatingPlan ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        onClick={() => {
                          if (!isUpdatingPlan && selectedUser.plano !== plan) {
                            console.log('Clicou para mudar o plano para:', plan);
                            updateUserPlan(selectedUser.id, plan);
                          }
                        }}
                        disabled={isUpdatingPlan}
                      >
                        <div className="mr-3">
                          {getPlanIcon(plan)}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            {getPlanName(plan)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedUser.plano === plan 
                              ? 'Plano atual' 
                              : ''}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Botão para forçar atualização do plano */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isUpdatingPlan && selectedUser?.id) {
                          forceUpdateUserPlan(selectedUser.id, selectedUser.plano);
                        }
                      }}
                      disabled={isUpdatingPlan || !selectedUser?.id}
                      className={`
                        flex items-center justify-center w-full p-3 rounded-lg 
                        text-sm font-medium transition-all duration-200
                        ${isUpdatingPlan 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
                      `}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Forçar Sincronização do Plano
                    </button>
                    <div className="mt-1 text-xs text-gray-500 text-center">
                      Use esta opção apenas se o método normal falhar
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rodapé do modal */}
              <div className="border-t border-gray-200 p-4 flex justify-between items-center">
                <div>
                  {selectedUser && (
                    <button
                      type="button"
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium flex items-center
                        ${selectedUser.banido 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'}
                        ${isUpdatingPlan ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                      onClick={() => toggleUserBan(selectedUser.id, !selectedUser.banido)}
                      disabled={isUpdatingPlan}
                    >
                      {selectedUser.banido ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Desbanir Usuário
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Banir Usuário
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    onClick={closeUserModal}
                    disabled={isUpdatingPlan}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className={`
                      px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center
                      ${isUpdatingPlan ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                    onClick={closeUserModal}
                    disabled={isUpdatingPlan}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Toast de sucesso */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Plano do usuário atualizado com sucesso!
        </motion.div>
      )}
    </div>
  );
};

export default UserPermissionsPage; 