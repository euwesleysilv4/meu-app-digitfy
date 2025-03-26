import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, AlertCircle, CheckCircle, Database, ArrowLeft, List, FileCog } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { planService } from '../../services/planService';
import { supabase } from '../../lib/supabase';

const RepairPlansPage: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [repairResult, setRepairResult] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se o usuário atual é administrador
  const isAdmin = profile?.role === 'admin';
  
  const handleRepairAllPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      setRepairResult(null);
      
      console.log('Iniciando reparo de todos os planos de usuários');
      
      const { success, message, error } = await planService.repairAllUserPlans();
      
      if (success && message) {
        setRepairResult(message as string);
        toast.success('Reparo de planos concluído com sucesso!');
      } else {
        setError(`Falha ao reparar planos: ${error?.message || 'Erro desconhecido'}`);
        toast.error('Falha ao reparar planos');
      }
    } catch (err: any) {
      console.error('Erro ao reparar planos:', err);
      setError(`Erro ao reparar planos: ${err.message || 'Erro desconhecido'}`);
      toast.error('Erro ao reparar planos');
    } finally {
      setLoading(false);
    }
  };
  
  const runDiagnostics = async () => {
    try {
      setDiagnosticLoading(true);
      setDiagnosticResult(null);
      
      // Verificar tabelas e colunas
      const { data: tablesData, error: tablesError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'profiles'
          ORDER BY column_name
        `
      });
      
      // Verificar funções que possam conter a coluna problemática
      const { data: functionsData, error: functionsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT p.proname, p.prosrc
          FROM pg_proc p
          WHERE p.prosrc LIKE '%data_expiracao_plano%'
        `
      });
      
      // Verificar gatilhos que possam conter a coluna problemática
      const { data: triggersData, error: triggersError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT trigger_name, event_manipulation, action_statement
          FROM information_schema.triggers
          WHERE event_object_table = 'profiles'
        `
      });
      
      setDiagnosticResult({
        tables: {
          data: tablesData,
          error: tablesError
        },
        functions: {
          data: functionsData,
          error: functionsError
        },
        triggers: {
          data: triggersData,
          error: triggersError
        }
      });
      
    } catch (err: any) {
      console.error('Erro ao executar diagnóstico:', err);
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setDiagnosticLoading(false);
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Acesso Negado</h2>
          <p className="text-red-600 mb-4">
            Você não tem permissão para acessar esta página.
            Apenas administradores podem acessar as ferramentas de reparo.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md
            shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reparo de Planos</h1>
            <p className="text-gray-600">
              Ferramentas para reparar e sincronizar planos de usuários
            </p>
          </div>
          <Link 
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md
            shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciamento
          </Link>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reparo de Planos */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="font-semibold text-lg text-blue-800 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
              Sincronização de Planos
            </h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Esta ferramenta sincroniza os planos entre a tabela <code className="bg-gray-100 px-1 rounded">profiles</code> e 
              os metadados do usuário em <code className="bg-gray-100 px-1 rounded">auth.users</code>.
              Use quando os usuários não estiverem vendo seus planos corretos após login.
            </p>
            
            <button
              onClick={handleRepairAllPlans}
              disabled={loading}
              className={`
                w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white 
                ${loading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}
                transition-colors duration-200
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reparar Todos os Planos
                </>
              )}
            </button>
            
            {/* Resultado do reparo */}
            {repairResult && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    {repairResult}
                  </p>
                </div>
              </div>
            )}
            
            {/* Erro */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Diagnóstico */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="font-semibold text-lg text-emerald-800 flex items-center">
              <Database className="w-5 h-5 mr-2 text-emerald-600" />
              Diagnóstico do Banco de Dados
            </h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Execute o diagnóstico para verificar se há referências à coluna 
              <code className="bg-gray-100 px-1 mx-1 rounded">data_expiracao_plano</code>
              que possam estar causando problemas.
            </p>
            
            <button
              onClick={runDiagnostics}
              disabled={diagnosticLoading}
              className={`
                w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white 
                ${diagnosticLoading 
                  ? 'bg-emerald-300 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700'}
                transition-colors duration-200
              `}
            >
              {diagnosticLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : (
                <>
                  <FileCog className="w-5 h-5 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </button>
            
            {/* Resultados do diagnóstico */}
            {diagnosticResult && (
              <div className="mt-4">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <List className="w-4 h-4 mr-1" />
                    Colunas na tabela 'profiles'
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md overflow-x-auto max-h-48">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 px-3">Nome da Coluna</th>
                          <th className="py-2 px-3">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticResult.tables.data && diagnosticResult.tables.data.length > 0 ? (
                          diagnosticResult.tables.data.map((column: any, index: number) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="py-2 px-3 font-mono">{column.column_name}</td>
                              <td className="py-2 px-3">{column.data_type}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-2 px-3 text-gray-500 text-center">
                              Nenhuma coluna encontrada ou erro ao acessar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <List className="w-4 h-4 mr-1" />
                    Funções com referência a 'data_expiracao_plano'
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md overflow-x-auto max-h-48">
                    {diagnosticResult.functions.data && diagnosticResult.functions.data.length > 0 ? (
                      diagnosticResult.functions.data.map((func: any, index: number) => (
                        <div key={index} className="mb-2 pb-2 border-b border-gray-200">
                          <div className="font-mono text-red-600 mb-1">{func.proname}</div>
                          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                            {func.prosrc}
                          </pre>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-2">
                        Nenhuma função problemática encontrada.
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <List className="w-4 h-4 mr-1" />
                    Gatilhos na tabela 'profiles'
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md overflow-x-auto max-h-48">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 px-3">Nome do Gatilho</th>
                          <th className="py-2 px-3">Evento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticResult.triggers.data && diagnosticResult.triggers.data.length > 0 ? (
                          diagnosticResult.triggers.data.map((trigger: any, index: number) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="py-2 px-3 font-mono">{trigger.trigger_name}</td>
                              <td className="py-2 px-3">{trigger.event_manipulation}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-2 px-3 text-gray-500 text-center">
                              Nenhum gatilho encontrado ou erro ao acessar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Instruções */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-purple-50 to-white">
          <h2 className="font-semibold text-lg text-purple-800 flex items-center">
            <FileCog className="w-5 h-5 mr-2 text-purple-600" />
            Instruções para Resolução de Problemas
          </h2>
        </div>
        
        <div className="p-6">
          <div className="prose max-w-none">
            <h3>Se o problema persistir após reparar os planos:</h3>
            
            <ol>
              <li>
                <strong>Execute o diagnóstico</strong> para identificar funções, gatilhos ou políticas que 
                possam estar referenciando a coluna <code>data_expiracao_plano</code>.
              </li>
              
              <li>
                <strong>Para cada função ou gatilho problemático</strong>, crie uma versão atualizada que 
                não utilize a coluna inexistente.
              </li>
              
              <li>
                <strong>Se nenhuma solução funcionar</strong>, utilize a seguinte abordagem manual:
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto my-2">
                  {`-- Execute no SQL Editor do Supabase
UPDATE auth.users
SET raw_user_meta_data = 
  raw_user_meta_data || 
  jsonb_build_object('plano', (
    SELECT plano FROM profiles 
    WHERE id = auth.users.id
  ))
WHERE id IN (
  SELECT id FROM profiles
);`}
                </pre>
              </li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepairPlansPage; 