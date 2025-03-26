import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Briefcase, Star, MessageSquare, Clock, CheckCircle, 
  Mail, Instagram, Phone, Info, Search,
  Filter, ArrowDown, ArrowUp, Download, Calendar, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../services/permissionService';

interface ServiceRequest {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  instagram: string;
  service_type: string;
  description: string;
  budget: number;
  payment_methods: string[];
  priority: string;
  delivery_date: string;
  status: string;
  created_at: string;
  avatar_url?: string;
}

const ServiceRequests: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    priority: '',
    serviceType: '',
    budget: ''
  });
  
  const { userPlan } = usePermissions();
  const { profile } = useAuth();

  useEffect(() => {
    // Verificação de permissão
    const hasPermission = userPlan === 'member' || userPlan === 'pro' || userPlan === 'elite';
    console.log("[ServiceRequests] Plano do usuário:", userPlan);
    console.log("[ServiceRequests] Permissão de acesso:", hasPermission);
    
    if (!hasPermission) {
      // Se não tiver permissão, mostrar mensagem e não carregar dados
      setIsLoading(false);
      return;
    }
    
    // Se tiver permissão, carregar dados
    loadServiceRequests();
  }, [userPlan]);

  const loadServiceRequests = async () => {
    try {
      setIsLoading(true);
      
      // Carregar apenas solicitações de serviços aprovadas
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
      console.log('Solicitações carregadas:', data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar solicitações de serviços:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrar solicitações
  const filteredRequests = requests
    .filter(request => {
      // Filtro de pesquisa
      const searchMatch = 
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtros adicionais
      const priorityMatch = 
        !filters.priority || request.priority.toLowerCase() === filters.priority.toLowerCase();
      
      const serviceTypeMatch = 
        !filters.serviceType || request.service_type.toLowerCase().includes(filters.serviceType.toLowerCase());
      
      const budgetMatch = !filters.budget || matchBudgetFilter(request.budget, filters.budget);
      
      return searchMatch && priorityMatch && serviceTypeMatch && budgetMatch;
    })
    .sort((a, b) => {
      // Ordenação dinâmica
      if (sortField === 'budget') {
        return sortOrder === 'asc' ? a.budget - b.budget : b.budget - a.budget;
      } else if (sortField === 'created_at') {
        return sortOrder === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortField === 'priority') {
        const priorityOrder = { 'Urgente': 3, 'Alta': 2, 'Normal': 1, 'Baixa': 0 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      }
      
      // Ordenação padrão para outros campos
      const valueA = (a[sortField as keyof ServiceRequest] || '').toString();
      const valueB = (b[sortField as keyof ServiceRequest] || '').toString();
      
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

  // Auxiliar para filtro de orçamento
  const matchBudgetFilter = (budget: number, filter: string) => {
    if (filter === 'low') return budget < 1000;
    if (filter === 'medium') return budget >= 1000 && budget < 3000;
    if (filter === 'high') return budget >= 3000;
    return true;
  };

  // Alternar ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default para novo campo é decrescente
    }
  };

  // Identificar o ícone do serviço
  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('design') || type.includes('arte')) return "🎨";
    if (type.includes('copy') || type.includes('texto')) return "✍️";
    if (type.includes('marketing') || type.includes('tráfego')) return "📊";
    if (type.includes('foto') || type.includes('vídeo')) return "📷";
    if (type.includes('web') || type.includes('site')) return "🌐";
    if (type.includes('social') || type.includes('rede')) return "📱";
    if (type.includes('programação') || type.includes('software')) return "💻";
    return "🔍";
  };

  // Verificar se o usuário tem permissão para visualizar esta página
  const hasPermission = userPlan === 'member' || userPlan === 'pro' || userPlan === 'elite';

  if (!hasPermission) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 mx-auto rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Acesso Restrito</h3>
          <p className="text-gray-500 mb-6">
            Você não tem permissão para acessar esta página. Esta funcionalidade está disponível apenas para planos Member, Pro e Elite.
          </p>
          <a
            href="/dashboard/upgrade-plan"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Fazer Upgrade
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Solicitações de Serviços</h1>
          <p className="text-emerald-600 mt-1">
            Encontre oportunidades e conecte-se com pessoas que precisam dos seus serviços
          </p>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar serviços..."
              className="pl-10 pr-4 py-2 w-full lg:w-96 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Aviso sobre a DigitFy */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-emerald-700">
              <strong>Aviso Importante:</strong> A DigitFy atua apenas como uma plataforma de conexão entre profissionais e clientes. Não nos responsabilizamos por acordos, negociações ou transações realizadas após o contato entre as partes. Recomendamos que todas as condições sejam claramente estabelecidas entre os envolvidos antes de qualquer compromisso.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">Todas as prioridades</option>
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Normal">Normal</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filters.serviceType}
              onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
            >
              <option value="">Todos os serviços</option>
              <option value="Design">Design</option>
              <option value="Copywriting">Copywriting</option>
              <option value="Marketing">Marketing</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Web">Web</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filters.budget}
              onChange={(e) => setFilters({...filters, budget: e.target.value})}
            >
              <option value="">Todos os orçamentos</option>
              <option value="low">Até R$ 1.000</option>
              <option value="medium">R$ 1.000 a R$ 3.000</option>
              <option value="high">Acima de R$ 3.000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-gray-500">
            Não encontramos solicitações de serviços que correspondam aos seus critérios de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                      {getServiceIcon(request.service_type)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.name}</h3>
                    <span className="text-emerald-600">{request.service_type}</span>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm ${
                    request.priority === 'Urgente' ? 'bg-red-100 text-red-700' :
                    request.priority === 'Alta' ? 'bg-orange-100 text-orange-700' :
                    request.priority === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.priority}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {request.payment_methods?.map((method, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                    >
                      {method}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(request.budget)}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(request.delivery_date)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contato:</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {request.email}
                    </div>
                    {request.whatsapp && (
                      <a
                        href={`https://wa.me/${request.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {request.whatsapp}
                      </a>
                    )}
                    {request.instagram && (
                      <a
                        href={`https://instagram.com/${request.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        {request.instagram}
                      </a>
                    )}
                  </div>
                  {request.whatsapp && (
                    <a
                      href={`https://wa.me/${request.whatsapp}?text=Olá! Vi sua solicitação na DigitFy e gostaria de oferecer meus serviços para ${request.service_type}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      Entrar em contato
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceRequests; 