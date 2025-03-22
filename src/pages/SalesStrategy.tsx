import { motion } from "framer-motion";
import { ArrowRight, Target, Zap } from "lucide-react";

interface Strategy {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  category: string;
}

const strategies: Strategy[] = [
  {
    id: 1,
    title: "Estratégia de Vendas Consultivas",
    description: "Aprenda a vender através da construção de relacionamentos e entendimento das necessidades do cliente.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    link: "#",
    category: "Relacionamento"
  },
  {
    id: 2,
    title: "Vendas por Valor",
    description: "Descubra como vender destacando o valor do seu produto ou serviço.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    link: "#",
    category: "Valor"
  },
  // Adicione mais estratégias aqui...
];

const SalesStrategy = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <Target className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Estratégias de Vendas
              </h1>
              <p className="text-gray-600 mt-1">
                Aprenda estratégias comprovadas para aumentar suas vendas
              </p>
            </div>
          </motion.div>

          {/* Coluna Direita */}
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:block"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </motion.div>
        </div>
      </motion.div>

      {/* Lista de Estratégias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Imagem */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={strategy.image} 
                alt={strategy.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
            </div>

            {/* Informações */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Categoria */}
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                <Zap className="w-4 h-4" />
                <span>{strategy.category}</span>
              </div>

              {/* Título e Descrição */}
              <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {strategy.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {strategy.description}
              </p>

              {/* Botão Acessar */}
              <div className="mt-auto">
                <a
                  href={strategy.link}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <span>Acessar Estratégia</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SalesStrategy; 