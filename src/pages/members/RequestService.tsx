import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Instagram, User, Briefcase, Clock, Calendar, QrCode, CreditCard, Barcode, HandCoins, Megaphone, Users } from 'lucide-react';

const RequestService = () => {
  const [request, setRequest] = useState({
    name: '',
    email: '',
    whatsapp: '',
    instagram: '',
    serviceType: '',
    description: '',
    budget: '',
    paymentMethods: [] as string[],
    priority: 'normal', // Prioridade padrão
    deliveryDate: '',
  });

  const [error, setError] = useState(''); // Estado para mensagem de erro

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({ ...prev, [name]: value }));
    setError(''); // Limpa o erro ao alterar o campo
  };

  const handlePaymentMethodChange = (method: string) => {
    setRequest(prev => {
      const methods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: methods };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: Pelo menos uma forma de contato deve ser preenchida
    if (!request.email && !request.whatsapp && !request.instagram) {
      setError('Escolha pelo menos uma forma de contato (E-mail, WhatsApp ou Instagram).');
      return;
    }

    // Se a validação passar, prossegue com o envio
    console.log('Serviço solicitado:', request);
    setError(''); // Limpa o erro
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
        <Briefcase size={40} className="text-emerald-600 mb-2" />
        <h1 className="text-3xl font-bold text-emerald-600 text-center">Solicitar Serviço</h1>
      </div>

      {/* Aviso Explicativo */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <h2 className="text-lg font-semibold text-emerald-600 mb-2">Como funciona?</h2>
        <p className="text-sm text-gray-600">
          Preencha o formulário ao lado para solicitar um serviço na nossa plataforma. O <strong>Preview</strong> à direita mostra como sua solicitação será exibida. Certifique-se de fornecer informações claras e completas para que possamos atendê-lo melhor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Título do Formulário */}
          <h2 className="text-xl font-semibold text-emerald-600 mb-6">Sobre sua Solicitação</h2>

          {/* Campo de Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <User size={16} />
              </span>
              <input
                type="text"
                id="name"
                name="name"
                value={request.name}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: João Silva"
                required
              />
            </div>
          </div>

          {/* Campo de E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={request.email}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: joao@exemplo.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Copie e cole seu e-mail para garantir que funcione corretamente.</p>
          </div>

          {/* Campo de WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <MessageCircle size={16} />
              </span>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={request.whatsapp}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: 11999999999"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Apenas números são permitidos. Ex: 11999999999</p>
          </div>

          {/* Campo de Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Instagram size={16} />
              </span>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={request.instagram}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: @joaosilva"
                required
              />
            </div>
          </div>

          {/* Campo de Tipo de Serviço */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
            <input
              type="text"
              id="serviceType"
              name="serviceType"
              value={request.serviceType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ex: Design Gráfico"
              required
            />
          </div>

          {/* Campo de Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={request.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Descreva o serviço que você precisa"
              rows={4}
              required
            />
          </div>

          {/* Campo de Orçamento */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Orçamento (R$)</label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={request.budget}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ex: 500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Quanto você está disposto a pagar pelo serviço?</p>
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
                    request.paymentMethods.includes(method)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  } transition-all duration-200 cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={request.paymentMethods.includes(method)}
                    onChange={() => handlePaymentMethodChange(method)}
                    className="hidden"
                  />
                  <span className="text-emerald-500">{icon}</span>
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prioridade na Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade na Entrega</label>
            <div className="space-y-2">
              {[
                { value: 'urgent', label: 'Urgente', icon: <Clock size={16} /> },
                { value: 'normal', label: 'Normal', icon: <Calendar size={16} /> },
                { value: 'specificDate', label: 'Data Específica', icon: <Calendar size={16} /> },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    request.priority === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  } transition-all duration-200 cursor-pointer`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={request.priority === option.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-emerald-500">{option.icon}</span>
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campo de Data de Entrega (se prioridade for "Data Específica") */}
          {request.priority === 'specificDate' && (
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Data de Entrega</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={request.deliveryDate}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Botão de Enviar */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md font-medium transition-all duration-300"
          >
            Enviar Solicitação
          </button>
        </form>

        {/* Preview */}
        <motion.div
          className="sticky top-6 h-fit bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h2 className="text-xl font-semibold text-emerald-600 mb-6">Preview da Solicitação</h2>
          <div className="space-y-4">
            {/* Nome */}
            {request.name && (
              <div className="flex items-center space-x-2">
                <User size={16} className="text-emerald-500" />
                <p className="text-sm text-gray-700">
                  <strong>Nome:</strong> {request.name}
                </p>
              </div>
            )}

            {/* E-mail */}
            {request.email && (
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-emerald-500" />
                <p className="text-sm text-gray-700">
                  <strong>E-mail:</strong> {request.email}
                </p>
              </div>
            )}

            {/* WhatsApp */}
            {request.whatsapp && (
              <div className="flex items-center space-x-2">
                <MessageCircle size={16} className="text-emerald-500" />
                <p className="text-sm text-gray-700">
                  <strong>WhatsApp:</strong> {request.whatsapp}
                </p>
              </div>
            )}

            {/* Instagram */}
            {request.instagram && (
              <div className="flex items-center space-x-2">
                <Instagram size={16} className="text-emerald-500" />
                <p className="text-sm text-gray-700">
                  <strong>Instagram:</strong> {request.instagram}
                </p>
              </div>
            )}

            {/* Tipo de Serviço */}
            {request.serviceType && (
              <div className="flex items-center space-x-2">
                <Briefcase size={16} className="text-emerald-500" />
                <p className="text-sm text-gray-700">
                  <strong>Serviço:</strong> {request.serviceType}
                </p>
              </div>
            )}

            {/* Descrição */}
            {request.description && (
              <div className="flex items-start space-x-2">
                <span className="text-emerald-500 mt-1">
                  <MessageCircle size={16} />
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Descrição:</strong> {request.description}
                </p>
              </div>
            )}

            {/* Orçamento */}
            {request.budget && (
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">
                  <HandCoins size={16} />
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Orçamento:</strong> R$ {request.budget}
                </p>
              </div>
            )}

            {/* Formas de Pagamento */}
            {request.paymentMethods.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="text-emerald-500 mt-1">
                  <CreditCard size={16} />
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Formas de Pagamento:</strong> {request.paymentMethods.join(', ')}
                </p>
              </div>
            )}

            {/* Prioridade na Entrega */}
            {request.priority && (
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">
                  {request.priority === 'urgent' ? <Clock size={16} /> : <Calendar size={16} />}
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Prioridade:</strong> {request.priority === 'urgent' ? 'Urgente' : request.priority === 'normal' ? 'Normal' : 'Data Específica'}
                </p>
              </div>
            )}

            {/* Data de Entrega (se prioridade for "Data Específica") */}
            {request.priority === 'specificDate' && request.deliveryDate && (
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">
                  <Calendar size={16} />
                </span>
                <p className="text-sm text-gray-700">
                  <strong>Data de Entrega:</strong> {new Date(request.deliveryDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RequestService; 