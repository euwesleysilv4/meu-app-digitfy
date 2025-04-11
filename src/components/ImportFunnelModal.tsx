import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FunnelSharingService, 
  TokenValidationResult,
  TokenData,
  FunnelCopyResult
} from '../services/funnelSharingService';
import { 
  AlertCircle, 
  Check, 
  ClipboardCheck, 
  Loader2, 
  X,
  FileText,
  ShoppingCart,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Definição explícita do tipo de status para evitar erros de comparação
type ImportStatus = 'idle' | 'validate' | 'confirm' | 'import' | 'success' | 'error' | 'refresh-needed';

// Componente de importação de funis compartilhados
export default function ImportFunnelModal({ isOpen, onClose, onImportSuccess }: { isOpen: boolean; onClose: () => void; onImportSuccess?: (funnelId: string) => void }) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [tokenInfo, setTokenInfo] = useState<TokenData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Fechar modal e resetar estado
  const handleClose = () => {
    setToken('');
    setStatus('idle');
    setTokenInfo(null);
    setErrorMessage('');
    onClose();
  };
  
  // Validar token de compartilhamento
  const validateToken = async () => {
    if (!token.trim()) {
      setErrorMessage('Por favor, insira um token válido');
      setStatus('error');
      return;
    }

    try {
      setStatus('validate');
      console.log('Validando token:', token.trim());
      const sharingService = new FunnelSharingService();
      const result = await sharingService.validateToken(token.trim());

      if (!result.valid) {
        console.error('Erro ao validar token:', result.message);
        setErrorMessage(`Erro ao validar token: ${result.message || 'Token inválido ou expirado'}`);
        setStatus('error');
        return;
      }

      if (!result.data || !result.data.funnelData) {
        setErrorMessage('Token inválido ou expirado');
        setStatus('error');
        return;
      }

      setTokenInfo(result.data);
      setStatus('confirm');
    } catch (error: any) {
      console.error('Erro inesperado ao validar token:', error);
      setErrorMessage(`Erro inesperado: ${error?.message || 'Falha na validação do token'}`);
      setStatus('error');
    }
  };
  
  // Importar funil para conta do usuário
  const importFunnel = async () => {
    if (!token.trim() || !tokenInfo) {
      setErrorMessage('Informações inválidas para importação');
      setStatus('error');
      return;
    }

    try {
      setStatus('import');
      console.log('Importando funil com token:', token.trim());
      const sharingService = new FunnelSharingService();
      const result = await sharingService.copySharedFunnel(token.trim());

      if (!result.success) {
        console.error('Erro ao importar funil:', result.message);
        setErrorMessage(`Erro ao importar funil: ${result.message || 'Falha na importação'}`);
        setStatus('error');
        return;
      }

      console.log('Funil importado com sucesso:', result);
      
      // Verificar se é necessário recarregar a página para ver os elementos
      if (result.needsRefresh) {
        setStatus('refresh-needed');
      } else {
        setStatus('success');
      }
      
      // Callback de sucesso após importação
      if (onImportSuccess && result.funnelId) {
        onImportSuccess(result.funnelId);
        
        // Se o funil importado precisa de reparo (está vazio mas deveria ter elementos)
        if (result.needsRefresh) {
          try {
            // Tentar consertar o funil vazio automaticamente
            console.log('Tentando consertar funil vazio:', result.funnelId);
            const repairResult = await sharingService.fixEmptySharedFunnel(result.funnelId, token.trim());
            console.log('Resultado do reparo automático:', repairResult);
          } catch (repairError) {
            console.warn('Erro ao tentar consertar funil vazio:', repairError);
          }
        }
      }
    } catch (error: any) {
      console.error('Erro inesperado ao importar funil:', error);
      setErrorMessage(`Erro inesperado: ${error?.message || 'Falha na importação do funil'}`);
      setStatus('error');
    }
  };
  
  // Renderizar ícone baseado no tipo do funil
  const renderFunnelIcon = () => {
    if (!tokenInfo?.funnelData) return <FileText size={24} />;
    
    const iconType = tokenInfo.funnelData.icon || 'FileText';
    console.log('Tipo do ícone:', iconType);
    
    switch (iconType) {
      case 'ShoppingCart':
        return <ShoppingCart size={24} />;
      case 'Briefcase':
      case 'BriefcaseBusiness':
        return <Briefcase size={24} />;
      default:
        return <FileText size={24} />;
    }
  };
  
  // Formatar tipo do funil para exibição
  const formatFunnelType = (type?: string) => {
    if (!type) return 'Desconhecido';
    
    switch (type) {
      case 'sales':
        return 'Vendas';
      case 'business':
        return 'Negócios';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Exibir contador de passos
  const getStepsCount = () => {
    if (!tokenInfo?.funnelData?.steps) return 0;
    return tokenInfo.funnelData.steps.length;
  };
  
  // Verificar se o modal está aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Importar Funil</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {status === 'idle' && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Cole o token de compartilhamento abaixo para importar um funil para sua conta.
            </p>
            
            <div className="mb-4">
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Token de Compartilhamento
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o token aqui"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}
            
            <button
              onClick={validateToken}
              disabled={token.trim() === ''}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              Validar Token
            </button>
          </>
        )}

        {status === 'validate' && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-emerald-600 mb-4" />
            <p>Validando token...</p>
          </div>
        )}

        {status === 'confirm' && tokenInfo && (
          <>
            <div className="border rounded-md p-4 mb-4">
              <div className="flex items-center mb-2">
                {renderFunnelIcon()}
                <span className="ml-2 font-semibold">{tokenInfo.funnelData?.title || 'Funil sem nome'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {formatFunnelType(tokenInfo.funnelData?.type)}
                </div>
                <div>
                  <span className="font-medium">Passos:</span> {getStepsCount()}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Deseja importar este funil para a sua conta? Você poderá editá-lo e personalizá-lo após a importação.
            </p>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => setStatus('idle')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Voltar
              </button>
              <button
                onClick={importFunnel}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                Importar Funil
              </button>
            </div>
          </>
        )}

        {status === 'import' && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-emerald-600 mb-4" />
            <p>Importando funil...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <Check className="mr-2" size={20} />
                <span>Funil importado com sucesso!</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Você será redirecionado para o seu novo funil em alguns instantes.
            </p>
          </>
        )}
        
        {status === 'refresh-needed' && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                <span>Funil importado, mas é necessário recarregar a página!</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Para visualizar corretamente todos os elementos do funil, você precisa 
              recarregar a página após fechar este modal.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Entendi
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errorMessage || 'Ocorreu um erro. Por favor, tente novamente.'}</span>
              </div>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Tentar Novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
} 