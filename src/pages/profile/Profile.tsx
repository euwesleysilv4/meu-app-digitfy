import React, { useState } from 'react';
import { 
  User, Mail, Calendar, MapPin,
  Edit2, Key, LogOut, 
  Download, BadgeCheck, RefreshCw, X, Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CurrentPlanCard from '../../components/CurrentPlanCard';
import { usePermissions } from '../../services/permissionService';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';
import { profiles, supabase } from '../../lib/supabase';

const Profile = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { getDownloadLimit, hasUnlimitedDownloads } = usePermissions();
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  const userName = profile?.nome || 'Usuário';
  const userEmail = profile?.email || 'email@exemplo.com';
  const userPlan = profile?.plano || 'gratuito';
  const downloadLimit = hasUnlimitedDownloads() ? 'Ilimitado' : getDownloadLimit();
  
  // Formatação da data de criação do perfil
  const formatarDataCriacao = () => {
    if (!profile?.data_criacao) return 'Janeiro 2024';
    
    const data = new Date(profile.data_criacao);
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${meses[data.getMonth()]} ${data.getFullYear()}`;
  };

  // Função para obter a inicial do nome do usuário
  const getInitial = () => {
    if (!userName || userName.trim() === '') return '?';
    return userName.trim()[0].toUpperCase();
  };

  // Função para entrar no modo de edição
  const handleEditMode = () => {
    setProfileImage(profile?.avatar_url || '');
    setCoverImage(profile?.cover_url || '');
    setIsEditing(true);
  };

  // Função para salvar alterações de perfil
  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: profileImage,
          cover_url: coverImage 
        })
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar o perfil local
      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Mostrar um indicador de carregamento temporário
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      loadingToast.textContent = 'Saindo...';
      document.body.appendChild(loadingToast);
      
      // Executar o logout
      await signOut();
      
      // Remover o toast de carregamento
      try {
        document.body.removeChild(loadingToast);
      } catch (e) {
        console.error('Erro ao remover toast:', e);
      }
      
      // Forçar redirecionamento para a página de login
      // Usar uma abordagem mais direta para evitar loops
      console.log('Redirecionando para a página de login após logout');
      
      // Limpar qualquer estado local que possa estar causando problemas
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Usar uma abordagem mais direta para o redirecionamento
      setTimeout(() => {
        window.location.replace('/auth');
      }, 100);
    } catch (error) {
      console.error('Exceção ao fazer logout:', error);
      // Garantir que o usuário seja redirecionado mesmo em caso de erro
      window.location.replace('/auth');
    }
  };

  // Função para forçar a sincronização do plano a partir do banco de dados
  const handleForcePlanSync = async () => {
    if (!profile?.id) return;
    
    setRefreshingPlan(true);
    try {
      console.log('Perfil: Iniciando sincronização de plano...');
      
      // Usar a função RPC segura para sincronizar o plano
      const { plan, error } = await profiles.syncUserPlan();
      
      if (error) {
        console.error('Perfil: Erro ao sincronizar plano via RPC:', error);
        toast.error('Erro: ' + (error instanceof Error ? error.message : 'Não foi possível sincronizar o plano'));
        
        // Se falhar, tentar o método alternativo
        console.log('Perfil: Tentando método alternativo de sincronização...');
        const { data: userData, error: fetchError } = await profiles.getOwnProfileSecure();
        
        if (fetchError || !userData) {
          console.error('Perfil: Erro no método alternativo:', fetchError);
          toast.error('Erro ao verificar plano: ' + 
            (fetchError instanceof Error ? fetchError.message : 'Não foi possível obter o perfil'));
          return;
        }
        
        if (userData.plano === profile.plano) {
          toast.success('Seu plano já está sincronizado corretamente');
        } else {
          await refreshProfile();
          toast.success(`Plano sincronizado: ${userData.plano}`);
        }
        
        return;
      }
      
      if (plan) {
        console.log('Perfil: Plano obtido via RPC:', plan);
        if (plan === profile.plano) {
          toast.success('Seu plano já está sincronizado corretamente');
        } else {
          // Forçar a atualização do perfil local com os dados do banco
          await refreshProfile();
          toast.success(`Plano sincronizado: ${plan}`);
        }
      } else {
        toast.error('Não foi possível determinar o plano atual');
      }
    } catch (error) {
      console.error('Perfil: Erro ao sincronizar plano:', error);
      toast.error('Erro: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setRefreshingPlan(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabeçalho do Perfil */}
      <div className="relative mb-8">
        {/* Banner */}
        <div 
          className="h-48 rounded-2xl overflow-hidden" 
          style={{
            backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : 'linear-gradient(to right, #10b981, #0d9488)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        {/* Avatar e Info Básica */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 px-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                <img
                  src={profile.avatar_url}
                  alt="Foto do perfil"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-emerald-500 shadow-lg flex items-center justify-center text-white text-5xl font-bold">
                {getInitial()}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Brasil
            </p>
          </div>
          
          {!isEditing ? (
            <button 
              onClick={handleEditMode}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" /> Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                {isSaving ? 
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </span> 
                  : 
                  <>
                    <Save className="h-4 w-4" /> Salvar
                  </>
                }
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Editar Perfil</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Foto de Perfil
              </label>
              <input 
                type="url" 
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://exemplo.com/sua-foto.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Adicione uma URL para sua foto de perfil. Deixe em branco para usar sua inicial.
              </p>

              {profileImage && (
                <div className="mt-2 rounded-lg overflow-hidden w-16 h-16">
                  <img 
                    src={profileImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Erro';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Foto de Capa
              </label>
              <input 
                type="url" 
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://exemplo.com/sua-capa.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Adicione uma URL para sua foto de capa. Deixe em branco para usar o padrão.
              </p>

              {coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden h-24 w-full">
                  <img 
                    src={coverImage} 
                    alt="Preview de capa" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/1200x300?text=Erro';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna de Informações Pessoais */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Informações Pessoais</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <User className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-5 w-5 text-emerald-500" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span>Membro desde {formatarDataCriacao()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Seu Plano e Limites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <div className="text-sm text-emerald-700 mb-1 flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4" /> Plano Atual
                </div>
                <div className="text-xl font-bold text-emerald-700">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl">
                <div className="text-sm text-emerald-700 mb-1 flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> Downloads
                </div>
                <div className="text-xl font-bold text-emerald-700">{downloadLimit}</div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row items-start gap-3">
              <button 
                onClick={() => navigate('/dashboard/upgrade')}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5"
              >
                Ver todos os planos disponíveis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button
                onClick={handleForcePlanSync}
                disabled={refreshingPlan}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
              >
                {refreshingPlan ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar plano
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Configurações</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <Key className="h-5 w-5 text-emerald-500" />
                <span>Alterar Senha</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>

          {/* Card com plano atual e opção de upgrade */}
          <CurrentPlanCard currentPlan={userPlan} />
        </div>
      </div>
    </div>
  );
};

export default Profile; 