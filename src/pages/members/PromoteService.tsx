import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Check, Megaphone, Mail, Instagram, HandCoins, CreditCard, QrCode, Barcode, Users, Calendar, Briefcase, Star, Crown } from 'lucide-react';
import { usePermissions } from '../../services/permissionService';

const PromoteService = () => {
  const { hasAccess, hasFeaturedServices } = usePermissions();
  const canPromoteService = hasAccess('promoteServices');
  const hasFeaturedListing = hasFeaturedServices?.() || hasAccess('featuredServiceListing');
  
  const [service, setService] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    contactWhatsApp: '',
    contactEmail: '',
    contactInstagram: '',
    image: '',
    paymentMethods: [] as string[],
    paymentOption: 'antecipado',
    featured: hasFeaturedListing
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setService(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setService(prev => {
      const methods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: methods };
    });
  };

  const handlePaymentOptionChange = (option: string) => {
    setService(prev => ({ ...prev, paymentOption: option }));
  };

  // Função para validar e formatar o preço (somente números)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    setService(prev => ({ ...prev, price: value }));
  };

  // Função para validar e formatar o WhatsApp (somente números)
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    setService(prev => ({ ...prev, contactWhatsApp: value }));
  };

  // Função para validar o e-mail
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validação básica de e-mail
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === '') {
      setService(prev => ({ ...prev, contactEmail: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar o formulário
    console.log('Serviço divulgado:', service);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Título Centralizado com Ícone */}
      <div className="flex flex-col items-center justify-center mb-8">
        <Megaphone size={40} className="text-emerald-600 mb-2" />
        <h1 className="text-3xl font-bold text-emerald-600 text-center">Divulgar Serviço</h1>
      </div>

      {/* Aviso Explicativo */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <h2 className="text-lg font-semibold text-emerald-600 mb-2">Como funciona?</h2>
        <p className="text-sm text-gray-600">
          Preencha o formulário ao lado para divulgar seu serviço na nossa plataforma. O <strong>Preview</strong> à direita mostra como sua postagem será exibida. Certifique-se de fornecer informações claras e completas para atrair mais clientes.
        </p>
      </div>

      {/* Elite Plan Feature */}
      {hasFeaturedListing && (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="text-purple-600" size={24} />
            <h2 className="text-lg font-semibold text-purple-700">Destaque do Plano Elite</h2>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Como usuário do plano Elite, seu serviço terá <strong>destaque especial</strong> na plataforma, aparecendo no topo das pesquisas e com um design diferenciado. Isso aumenta significativamente a visibilidade e a taxa de contratação.
          </p>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg w-fit">
            <Star className="text-purple-500 fill-purple-500" size={16} />
            <span className="text-xs font-medium text-purple-700">Seu serviço terá um distintivo especial de Elite</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Campo de Título (Estrutura copiada de Solicitar Serviço) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Serviço</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Briefcase size={16} />
              </span>
              <input
                type="text"
                id="title"
                name="title"
                value={service.title}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: Design Gráfico"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição do Serviço</label>
            <textarea
              id="description"
              name="description"
              value={service.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Descreva detalhadamente o seu serviço..."
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <input
              type="text"
              id="category"
              name="category"
              value={service.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ex: Design e Criação"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="text"
                id="price"
                name="price"
                value={service.price}
                onChange={handlePriceChange}
                className="mt-1 block w-full pl-8 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: 100"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Apenas números são permitidos.</p>
          </div>

          <div>
            <label htmlFor="contactWhatsApp" className="block text-sm font-medium text-gray-700">Contato (WhatsApp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <MessageCircle size={16} />
              </span>
              <input
                type="text"
                id="contactWhatsApp"
                name="contactWhatsApp"
                value={service.contactWhatsApp}
                onChange={handleWhatsAppChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: 11999999999"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Apenas números são permitidos. Ex: 11999999999</p>
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contato (E-mail)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={service.contactEmail}
                onChange={handleEmailChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: contato@exemplo.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Copie e cole seu e-mail para garantir que funcione corretamente.</p>
          </div>

          <div>
            <label htmlFor="contactInstagram" className="block text-sm font-medium text-gray-700">Contato (Instagram)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Instagram size={16} />
              </span>
              <input
                type="text"
                id="contactInstagram"
                name="contactInstagram"
                value={service.contactInstagram}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: @seuinstagram"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
            <input
              type="text"
              id="image"
              name="image"
              value={service.image}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Cole o link da imagem aqui"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Você pode usar o site{' '}
              <a
                href="https://postimages.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-600 underline"
              >
                PostImage.org
              </a>{' '}
              para hospedar sua imagem e obter uma URL.
            </p>
          </div>

          {/* Formas de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formas de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { method: 'Pix', icon: <QrCode size={16} /> },
                { method: 'Cartão', icon: <CreditCard size={16} /> },
                { method: 'Boleto', icon: <Barcode size={16} /> },
                { method: 'Comissão', icon: <HandCoins size={16} /> },
                { method: 'Divulgação', icon: <Megaphone size={16} /> },
                { method: 'Cooprodução', icon: <Users size={16} /> },
              ].map(({ method, icon }) => (
                <label
                  key={method}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    service.paymentMethods.includes(method)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  } transition-all duration-200 cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={service.paymentMethods.includes(method)}
                    onChange={() => handlePaymentMethodChange(method)}
                    className="hidden"
                  />
                  <span className="text-emerald-500">{icon}</span>
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Opções de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opções de Pagamento</label>
            <div className="space-y-2">
              <label className={`flex items-center space-x-2 p-3 rounded-lg border ${
                service.paymentOption === 'antecipado'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              } transition-all duration-200 cursor-pointer`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="antecipado"
                  checked={service.paymentOption === 'antecipado'}
                  onChange={() => handlePaymentOptionChange('antecipado')}
                  className="hidden"
                />
                <span className="text-emerald-500">
                  <HandCoins size={16} />
                </span>
                <span className="text-sm text-gray-700">Pagamento antecipado (10% de desconto)</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 rounded-lg border ${
                service.paymentOption === 'parcelado'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              } transition-all duration-200 cursor-pointer`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="parcelado"
                  checked={service.paymentOption === 'parcelado'}
                  onChange={() => handlePaymentOptionChange('parcelado')}
                  className="hidden"
                />
                <span className="text-emerald-500">
                  <CreditCard size={16} />
                </span>
                <span className="text-sm text-gray-700">50% no pedido e 50% na entrega</span>
              </label>
              <label className={`flex items-center space-x-2 p-3 rounded-lg border ${
                service.paymentOption === 'entrega'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              } transition-all duration-200 cursor-pointer`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="entrega"
                  checked={service.paymentOption === 'entrega'}
                  onChange={() => handlePaymentOptionChange('entrega')}
                  className="hidden"
                />
                <span className="text-emerald-500">
                  <Calendar size={16} />
                </span>
                <span className="text-sm text-gray-700">Pagamento somente na entrega</span>
              </label>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
            >
              Divulgar Serviço
            </motion.button>
          </div>
        </form>

        {/* Preview do Serviço */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg relative">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Preview</h3>
          
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all relative">
            {hasFeaturedListing && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 text-center text-sm font-medium">
                <span className="flex items-center justify-center gap-1">
                  <Crown size={14} className="inline" />
                  Serviço em Destaque
                </span>
              </div>
            )}
            
            <div className="p-4">
              {/* Título e Categoria */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {service.title || "Título do Serviço"}
                </h3>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded mt-1">
                  {service.category || "Categoria"}
                </span>
              </div>
              
              {/* Descrição */}
              <p className="text-gray-600 text-sm mb-4">
                {service.description || "Descrição detalhada do serviço que você oferece..."}
              </p>
              
              {/* Preço */}
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold text-emerald-600 mr-2">
                  {service.price ? `R$ ${service.price},00` : "R$ 0,00"}
                </span>
                <span className="text-xs text-gray-500">
                  {service.paymentOption === 'antecipado' ? 'Pagamento antecipado' : service.paymentOption === 'parcial' ? 'Entrada + Restante' : 'Ao finalizar'}
                </span>
              </div>
              
              {/* Métodos de Pagamento */}
              {service.paymentMethods.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Métodos de Pagamento</p>
                  <div className="flex flex-wrap gap-1">
                    {service.paymentMethods.map(method => (
                      <span key={method} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contatos */}
              <div className="space-y-2">
                {service.contactWhatsApp && (
                  <div className="flex items-center text-sm">
                    <MessageCircle className="text-emerald-500 mr-2" size={16} />
                    <span className="text-gray-700">{service.contactWhatsApp}</span>
                  </div>
                )}
                
                {service.contactEmail && (
                  <div className="flex items-center text-sm">
                    <Mail className="text-emerald-500 mr-2" size={16} />
                    <span className="text-gray-700">{service.contactEmail}</span>
                  </div>
                )}
                
                {service.contactInstagram && (
                  <div className="flex items-center text-sm">
                    <Instagram className="text-emerald-500 mr-2" size={16} />
                    <span className="text-gray-700">{service.contactInstagram}</span>
                  </div>
                )}
              </div>
            </div>
            
            {hasFeaturedListing && (
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-1 px-6 text-xs font-bold uppercase rotate-45 origin-bottom-right translate-y-2 translate-x-2">
                  Elite
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Este é apenas um preview. Seu serviço poderá ser exibido de forma diferente na plataforma.
            {hasFeaturedListing && " Seu serviço terá um destaque especial por ser do plano Elite."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PromoteService; 