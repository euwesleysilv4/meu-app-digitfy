import React from 'react';
import { Briefcase, Megaphone, HandCoins, Users, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesShowcase = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Título Centralizado com Ícone */}
      <div className="flex flex-col items-center justify-center mb-8">
        <Briefcase size={40} className="text-emerald-600 mb-2" />
        <h1 className="text-3xl font-bold text-emerald-600 text-center">Vitrine de Serviços</h1>
      </div>

      {/* Aviso Explicativo */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <h2 className="text-lg font-semibold text-emerald-600 mb-2">Como funciona?</h2>
        <p className="text-sm text-gray-600">
          Aqui você pode tanto <strong>divulgar seus serviços</strong> quanto <strong>solicitar serviços</strong> de outros profissionais. Escolha a opção que melhor atende às suas necessidades.
        </p>
      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Divulgar Serviço */}
        <Link
          to="/members/promote-service"
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:border-emerald-300 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Megaphone size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-600">Divulgar Serviço</h2>
              <p className="text-sm text-gray-600">Ofereça seus serviços para outros profissionais.</p>
            </div>
          </div>
        </Link>

        {/* Card: Solicitar Serviço */}
        <Link
          to="/members/request-service"
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:border-emerald-300 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <HandCoins size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-600">Solicitar Serviço</h2>
              <p className="text-sm text-gray-600">Encontre profissionais para atender suas necessidades.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Lista de Serviços Divulgados */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-emerald-600 mb-6">Serviços Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exemplo de Serviço */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Users size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-600">Design Gráfico</h3>
                <p className="text-sm text-gray-500">Criação de logos e identidade visual.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Preço: R$ 500</p>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300">
              Contratar
            </button>
          </div>
          {/* Adicione mais serviços aqui */}
        </div>
      </div>

      {/* Lista de Serviços Solicitados */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-emerald-600 mb-6">Serviços Solicitados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exemplo de Solicitação */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Search size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-600">Desenvolvimento Web</h3>
                <p className="text-sm text-gray-500">Criação de site institucional.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Orçamento: R$ 2000</p>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300">
              Oferecer Serviço
            </button>
          </div>
          {/* Adicione mais solicitações aqui */}
        </div>
      </div>
    </div>
  );
};

export default ServicesShowcase; 