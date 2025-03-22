import React from 'react';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: string;
    contact: string;
  };
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-emerald-600 mb-2">{service.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
      <p className="text-sm text-gray-700 mb-2"><strong>Preço:</strong> {service.price}</p>
      <p className="text-sm text-gray-700"><strong>Contato:</strong> {service.contact}</p>
    </div>
  );
};

export default ServiceCard; 