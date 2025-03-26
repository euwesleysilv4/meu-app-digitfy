import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase,
  ArrowLeft,
  Search,
  Check,
  X,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

interface ServicePromotion {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  contact_whatsapp: string;
  contact_email: string;
  contact_instagram: string;
  image_url: string;
  payment_methods: string[];
  payment_option: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
}

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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
}

const ServiceManagement: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'promotions' | 'requests'>('promotions');
  const [promotions, setPromotions] = useState<ServicePromotion[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
      
      if (error || !adminStatus) {
        setIsAdmin(false);
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
      loadServices();
    } catch (err) {
      console.error('Erro ao verificar status de administrador:', err);
      setIsAdmin(false);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      // Carregar promoções de serviços
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('service_promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (promotionsError) throw promotionsError;
      setPromotions(promotionsData || []);

      // Carregar solicitações de serviços
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const handleStatusChange = async (
    id: string, 
    newStatus: 'approved' | 'rejected',
    type: 'promotion' | 'request'
  ) => {
    try {
      const table = type === 'promotion' ? 'service_promotions' : 'service_requests';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      if (type === 'promotion') {
        setPromotions(promotions.map(p => 
          p.id === id ? { ...p, status: newStatus } : p
        ));
      } else {
        setRequests(requests.map(r => 
          r.id === id ? { ...r, status: newStatus } : r
        ));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const filteredPromotions = promotions.filter(promo =>
    promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(req =>
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
              Você não tem permissões para acessar esta área.
            </p>
          </div>
        </motion.div>
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
                <Briefcase className="h-8 w-8 mr-3 text-emerald-600" />
                Gerenciamento de Serviços
              </h1>
              <p className="text-gray-600 mt-1">
                Aprove ou rejeite serviços e solicitações de marketing digital
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'promotions'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-emerald-50'
              }`}
            >
              <MessageSquare size={20} />
              <span>Divulgação de Serviços</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'requests'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-emerald-50'
              }`}
            >
              <Briefcase size={20} />
              <span>Solicitações de Serviços</span>
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  {activeTab === 'promotions' ? 'Serviços para Divulgação' : 'Solicitações de Serviços'}
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Serviços */}
            <div className="overflow-x-auto">
              {activeTab === 'promotions' ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPromotions.map(promotion => (
                      <tr key={promotion.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{promotion.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{promotion.description}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(promotion.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${promotion.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                            ${promotion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${promotion.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {promotion.status === 'approved' && 'Aprovado'}
                            {promotion.status === 'pending' && 'Pendente'}
                            {promotion.status === 'rejected' && 'Rejeitado'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(promotion.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStatusChange(promotion.id, 'approved', 'promotion')}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              title="Aprovar serviço"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(promotion.id, 'rejected', 'promotion')}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Rejeitar serviço"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredRequests.map(request => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{request.service_type}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(request.budget)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                            ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${request.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {request.status === 'approved' && 'Aprovado'}
                            {request.status === 'pending' && 'Pendente'}
                            {request.status === 'rejected' && 'Rejeitado'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStatusChange(request.id, 'approved', 'request')}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              title="Aprovar solicitação"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'rejected', 'request')}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Rejeitar solicitação"
                            >
                              <X className="h-5 w-5" />
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

export default ServiceManagement; 