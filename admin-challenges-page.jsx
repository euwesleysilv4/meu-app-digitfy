import React, { useState, useEffect } from 'react';
import AdminChallengesDashboard from './admin-challenges-dashboard';
import AdminChallengeForm from './admin-challenge-form';
import { Toast } from '../components/Toast'; // Ajuste o caminho conforme necessário
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho conforme necessário
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho conforme necessário

const AdminChallengesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const { user, isAdmin } = useAuth(); // Suponha que você tenha um contexto de autenticação

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      try {
        // Buscar papel do usuário no Supabase
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Se não for admin, redirecionar
        if (data.role !== 'admin') {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error('Erro ao verificar papel do usuário:', err);
      }
    };

    checkAdminRole();
  }, [user]);

  // Manipulador para abrir o formulário de criação
  const handleCreate = () => {
    setCurrentChallenge(null);
    setIsCreating(true);
    setIsFormOpen(true);
  };

  // Manipulador para abrir o formulário de edição
  const handleEdit = (challenge) => {
    setCurrentChallenge(challenge);
    setIsCreating(false);
    setIsFormOpen(true);
  };

  // Manipulador para fechar o formulário
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Manipulador para quando a operação for bem-sucedida
  const handleSuccess = (message) => {
    setToast({
      visible: true,
      message,
      type: 'success'
    });
    
    setIsFormOpen(false);
    setNeedsRefresh(true);
    
    // Esconder a toast após 5 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Componente Toast para notificações
  const ToastNotification = () => {
    if (!toast.visible) return null;

    return (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    );
  };

  // Se não for administrador, não renderizar o conteúdo
  if (!isAdmin && !user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Esta página é restrita a administradores. Faça login com uma conta de administrador para acessar.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast de notificação */}
      <ToastNotification />
      
      {/* Painel principal */}
      <AdminChallengesDashboard 
        onEdit={handleEdit}
        onCreate={handleCreate}
        needsRefresh={needsRefresh}
        setNeedsRefresh={setNeedsRefresh}
      />
      
      {/* Formulário (modal) */}
      {isFormOpen && (
        <AdminChallengeForm
          challenge={currentChallenge}
          isCreating={isCreating}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AdminChallengesPage; 