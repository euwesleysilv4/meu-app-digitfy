import React from 'react';
import ServiceCard from '../../components/ServiceCard';

const Members = () => {
  // Dados de exemplo (substituir por dados reais)
  const servicesToPromote = [
    { id: 1, title: 'Design Gráfico', description: 'Criação de logos e identidade visual.', price: 'R$ 200', contact: '@designer' },
    { id: 2, title: 'Desenvolvimento Web', description: 'Criação de sites responsivos.', price: 'R$ 1000', contact: '@devweb' },
  ];

  const servicesToRequest = [
    { id: 3, title: 'Tradução de Textos', description: 'Tradução de documentos para inglês.', price: 'R$ 50', contact: '@tradutor' },
    { id: 4, title: 'Edição de Vídeos', description: 'Edição profissional para YouTube.', price: 'R$ 300', contact: '@editor' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-8">Área de Membros</h1>

      {/* Seção: Quem quer divulgar serviços */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-6">Serviços para Divulgar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesToPromote.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Seção: Quem quer solicitar serviços */}
      <section>
        <h2 className="text-2xl font-semibold text-emerald-600 mb-6">Serviços para Solicitar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesToRequest.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Members; 