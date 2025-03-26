import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Briefcase, Star, MessageSquare, Clock, CheckCircle, 
  Mail, Instagram, Phone, Info, Palette, Edit3, BarChart2,
  Camera, Globe, Megaphone, Laptop, HelpCircle
} from 'lucide-react';

interface ServicePromotion {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  contact_whatsapp: string;
  contact_email: string;
  contact_instagram: string;
  payment_methods: string[];
  payment_option: string;
  status: string;
  created_at: string;
  image_url?: string;
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
  status: string;
  created_at: string;
  avatar_url?: string;
}

const Members = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [promotions, setPromotions] = useState<ServicePromotion[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'promotions' | 'requests'>('promotions');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Carregar promoções de serviços aprovadas
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('service_promotions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (promotionsError) throw promotionsError;
      setPromotions(promotionsData || []);

      // Carregar solicitações de serviços aprovadas
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('design') || type.includes('arte')) return Palette;
    if (type.includes('copy') || type.includes('texto')) return Edit3;
    if (type.includes('marketing') || type.includes('tráfego')) return BarChart2;
    if (type.includes('foto') || type.includes('vídeo')) return Camera;
    if (type.includes('web') || type.includes('site')) return Globe;
    if (type.includes('social') || type.includes('rede')) return Megaphone;
    if (type.includes('programação') || type.includes('software')) return Laptop;
    return HelpCircle;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Briefcase className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bem-vindo</h1>
          <p className="text-emerald-600 mt-1">
            Aqui você pode solicitar Serviços e encontrar Profissionais Disponíveis
          </p>
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

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'promotions'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Serviços Disponíveis
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'requests'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Solicitações de Serviços
        </button>
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'promotions' ? (
          promotions.map((promotion) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              {promotion.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={promotion.image_url} 
                    alt={promotion.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{promotion.title}</h3>
                <p className="text-gray-600 mb-4">{promotion.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm">
                    {promotion.category}
                  </span>
                  {promotion.payment_methods.map((method, index) => (
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
                    {formatCurrency(promotion.price)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {promotion.payment_option}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contato:</h4>
                  <div className="space-y-2 mb-4">
                    {promotion.contact_whatsapp && (
                      <a
                        href={`https://wa.me/${promotion.contact_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {promotion.contact_whatsapp}
                      </a>
                    )}
                    {promotion.contact_email && (
                      <a
                        href={`mailto:${promotion.contact_email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {promotion.contact_email}
                      </a>
                    )}
                    {promotion.contact_instagram && (
                      <a
                        href={`https://instagram.com/${promotion.contact_instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        {promotion.contact_instagram}
                      </a>
                    )}
                  </div>
                  {promotion.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${promotion.contact_whatsapp}?text=Olá! Vi seu serviço na DigitFy e gostaria de mais informações sobre ${promotion.title}`}
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
          ))
        ) : (
          requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      {React.createElement(getServiceIcon(request.service_type), {
                        size: 24,
                        className: "text-emerald-600"
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.name}</h3>
                    <span className="text-emerald-600">{request.service_type}</span>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm">
                    {request.priority}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {request.payment_methods.map((method, index) => (
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
                  <span className="text-sm text-gray-500">
                    Entrega até: {formatDate(request.delivery_date)}
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
          ))
        )}
      </div>
    </div>
  );
};

export default Members; 