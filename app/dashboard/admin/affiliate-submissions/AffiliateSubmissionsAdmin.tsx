'use client';

import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, CheckCircle, XCircle, Eye, AlertTriangle, Clock, Search, Filter } from 'lucide-react';
import { affiliateSubmissionService, AffiliateSubmission } from '../../services/affiliateSubmissionService';
import { supabase } from '../../../src/lib/supabase';
import Link from 'next/link';

export default function AffiliateSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<AffiliateSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'pending' as 'all' | 'pending' | 'approved' | 'rejected',
    search: '',
  });
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [currentSubmission, setCurrentSubmission] = useState<AffiliateSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);

  // Buscar submissões
  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;

      if (filters.status === 'all') {
        result = await affiliateSubmissionService.listAllSubmissions();
      } else {
        // Implementar filtro por status na API
        result = await affiliateSubmissionService.listAllSubmissions();
        if (result.data) {
          result.data = result.data.filter(sub => sub.status === filters.status);
        }
      }

      if (result.error) {
        throw result.error;
      }

      const allSubmissions = result.data || [];
      
      // Aplicar filtro de busca se houver
      const filteredSubmissions = filters.search
        ? allSubmissions.filter(
            sub =>
              sub.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
              sub.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
              sub.category?.toLowerCase().includes(filters.search.toLowerCase()) ||
              sub.submitter_email?.toLowerCase().includes(filters.search.toLowerCase())
          )
        : allSubmissions;

      setSubmissions(filteredSubmissions);
      
      // Calcular contagens
      setStatusCounts({
        all: allSubmissions.length,
        pending: allSubmissions.filter(sub => sub.status === 'pending').length,
        approved: allSubmissions.filter(sub => sub.status === 'approved').length,
        rejected: allSubmissions.filter(sub => sub.status === 'rejected').length,
      });
    } catch (err: any) {
      console.error('Erro ao buscar submissões:', err);
      setError(err.message || 'Erro ao buscar submissões');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters.status]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (filters.search.length > 0) {
        fetchSubmissions();
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [filters.search]);

  // Função para visualizar detalhes da submissão
  const handleViewSubmission = (submission: AffiliateSubmission) => {
    setCurrentSubmission(submission);
    setIsModalOpen(true);
    setReviewNotes('');
  };

  // Funções para aprovar/rejeitar submissões
  const handleApproveSubmission = async () => {
    if (!currentSubmission?.id) return;
    
    setActionLoading(true);
    setCurrentAction('approve');
    
    try {
      // Obter o ID do usuário atual (admin)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      const { success, error } = await affiliateSubmissionService.approveSubmission(
        currentSubmission.id,
        userData.user.id,
        reviewNotes || 'Produto aprovado.'
      );
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de submissões
      fetchSubmissions();
      setIsModalOpen(false);
      alert('Produto aprovado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao aprovar submissão:', err);
      alert(`Erro ao aprovar submissão: ${err.message}`);
    } finally {
      setActionLoading(false);
      setCurrentAction(null);
    }
  };

  const handleRejectSubmission = async () => {
    if (!currentSubmission?.id) return;
    if (!reviewNotes) {
      alert('Por favor, forneça o motivo da rejeição.');
      return;
    }
    
    setActionLoading(true);
    setCurrentAction('reject');
    
    try {
      // Obter o ID do usuário atual (admin)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      const { success, error } = await affiliateSubmissionService.rejectSubmission(
        currentSubmission.id,
        userData.user.id,
        reviewNotes
      );
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de submissões
      fetchSubmissions();
      setIsModalOpen(false);
      alert('Produto rejeitado.');
    } catch (err: any) {
      console.error('Erro ao rejeitar submissão:', err);
      alert(`Erro ao rejeitar submissão: ${err.message}`);
    } finally {
      setActionLoading(false);
      setCurrentAction(null);
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubmission(null);
    setReviewNotes('');
  };

  // Renderizar status com cor adequada
  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center text-xs font-medium">
            <Clock size={14} className="mr-1" />
            Pendente
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center text-xs font-medium">
            <CheckCircle size={14} className="mr-1" />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center text-xs font-medium">
            <XCircle size={14} className="mr-1" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-4 md:p-6">
      <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Package className="h-6 w-6 text-indigo-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Gestão de Submissões de Afiliados</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/admin/affiliate-products"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300"
            >
              Produtos de Afiliados
            </Link>
            
            <button
              onClick={fetchSubmissions}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-200"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      {/* Filtros e Contagens */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              className={`px-3 py-1 rounded-lg flex items-center ${
                filters.status === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
              className={`px-3 py-1 rounded-lg flex items-center ${
                filters.status === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Clock size={16} className="mr-1" />
              Pendentes ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'approved' }))}
              className={`px-3 py-1 rounded-lg flex items-center ${
                filters.status === 'approved'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle size={16} className="mr-1" />
              Aprovadas ({statusCounts.approved})
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'rejected' }))}
              className={`px-3 py-1 rounded-lg flex items-center ${
                filters.status === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <XCircle size={16} className="mr-1" />
              Rejeitadas ({statusCounts.rejected})
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Buscar submissões..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          <div className="flex items-center">
            <AlertTriangle className="mr-3 h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabela de submissões */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma submissão encontrada</h3>
            <p className="text-gray-500">
              {filters.search
                ? 'Nenhuma submissão corresponde aos critérios de busca.'
                : filters.status === 'pending'
                ? 'Não há submissões pendentes para análise.'
                : filters.status === 'approved'
                ? 'Não há submissões aprovadas para exibir.'
                : filters.status === 'rejected'
                ? 'Não há submissões rejeitadas para exibir.'
                : 'Não há submissões para exibir.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria/Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {submission.image_url ? (
                            <img 
                              src={submission.image_url} 
                              alt={submission.name} 
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {submission.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {submission.price_display || `R$ ${submission.price?.toFixed(2)}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.category || "—"}</div>
                      <div className="text-sm text-gray-500">{submission.platform || "Hotmart"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.submitter_email}</div>
                      <div className="text-sm text-gray-500">{submission.submitter_instagram || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewSubmission(submission)}
                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-lg hover:bg-indigo-50 mr-2"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalhes e revisão */}
      {isModalOpen && currentSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Detalhes da Submissão</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informações do Produto</h3>
                  
                  {/* Imagem do produto */}
                  {currentSubmission.image_url && (
                    <div className="mb-4">
                      <img
                        src={currentSubmission.image_url}
                        alt={currentSubmission.name}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nome do Produto</p>
                      <p className="font-medium">{currentSubmission.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Descrição</p>
                      <p className="text-sm whitespace-pre-wrap">{currentSubmission.description || "—"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Preço</p>
                        <p className="font-medium">{currentSubmission.price_display || `R$ ${currentSubmission.price?.toFixed(2)}` || "—"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Comissão (%)</p>
                        <p className="font-medium">{currentSubmission.commission_rate || "—"}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Categoria</p>
                        <p>{currentSubmission.category || "—"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Plataforma</p>
                        <p>{currentSubmission.platform || "Hotmart"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Vendedor/Produtor</p>
                      <p>{currentSubmission.vendor_name || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">URL de Vendas</p>
                      {currentSubmission.sales_url ? (
                        <a
                          href={currentSubmission.sales_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 truncate block"
                        >
                          {currentSubmission.sales_url}
                        </a>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Link de Afiliado</p>
                      {currentSubmission.affiliate_link ? (
                        <a
                          href={currentSubmission.affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 truncate block"
                        >
                          {currentSubmission.affiliate_link}
                        </a>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                    
                    {currentSubmission.benefits && currentSubmission.benefits.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Benefícios</p>
                        <ul className="list-disc list-inside text-sm">
                          {currentSubmission.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informações da Submissão</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">E-mail do Submissor</p>
                      <p>{currentSubmission.submitter_email || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Instagram</p>
                      <p>{currentSubmission.submitter_instagram || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Mensagem</p>
                      <p className="text-sm whitespace-pre-wrap">{currentSubmission.submitter_message || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Data de Submissão</p>
                      <p>{formatDate(currentSubmission.submitted_at)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">{renderStatus(currentSubmission.status)}</div>
                    </div>
                    
                    {currentSubmission.status !== 'pending' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Data da Revisão</p>
                          <p>{formatDate(currentSubmission.reviewed_at)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Notas da Revisão</p>
                          <p className="text-sm whitespace-pre-wrap">{currentSubmission.review_notes || "—"}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Seção de revisão para submissões pendentes */}
                  {currentSubmission.status === 'pending' && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Revisar Submissão</h3>
                      
                      <div className="mb-4">
                        <label htmlFor="review_notes" className="block text-sm font-medium text-gray-700 mb-2">
                          Notas da Revisão
                        </label>
                        <textarea
                          id="review_notes"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Adicione notas sobre esta submissão. Para rejeições, explique o motivo."
                        />
                      </div>
                      
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={handleRejectSubmission}
                          disabled={actionLoading}
                          className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                            actionLoading && currentAction === 'reject'
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {actionLoading && currentAction === 'reject' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <XCircle size={18} className="mr-1" />
                              Rejeitar
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleApproveSubmission}
                          disabled={actionLoading}
                          className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                            actionLoading && currentAction === 'approve'
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {actionLoading && currentAction === 'approve' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={18} className="mr-1" />
                              Aprovar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 