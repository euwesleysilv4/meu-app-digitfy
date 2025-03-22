import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, CheckCircle, Clock } from 'lucide-react';

const Recommended = () => {
  const products = [
    {
      id: 1,
      name: 'Curso de Marketing Digital',
      description: 'Aprenda estratégias avançadas de marketing digital.',
      price: 'R$ 297,00',
      rating: 4.9,
      reviews: 127,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Ebook de Copywriting',
      description: 'Domine a arte de escrever textos persuasivos.',
      price: 'R$ 47,00',
      rating: 4.8,
      reviews: 94,
      image: 'https://via.placeholder.com/150',
    },
    // Adicione mais produtos aqui
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Título e Descrição */}
      <motion.div 
        className="flex flex-col space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-emerald-600">Produtos Recomendados</h1>
        <p className="text-gray-600 max-w-3xl">
          Confira nossos produtos mais recomendados para impulsionar seu negócio digital.
        </p>
      </motion.div>

      {/* Lista de Produtos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-emerald-600 mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Star className="text-yellow-400" size={16} />
              <span>{product.rating} ({product.reviews} avaliações)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-6">{product.price}</p>
            <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all">
              Comprar Agora
            </button>
          </motion.div>
        ))}
      </div>

      {/* Botões Fixos na Base */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-100">
        <div className="flex justify-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
            <ShoppingBag size={20} />
            <span>Ver Todos os Produtos</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 hover:border-emerald-300 transition-all">
            <CheckCircle size={20} />
            <span>Meus Pedidos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommended; 