import { motion } from "framer-motion";
import { Check, ShoppingBag, X } from "lucide-react";

interface Product {
  rank: number;
  name: string;
  category: string;
  price: string;
  benefits: string[];
  image: string;
}

const products: Product[] = [
  {
    rank: 1,
    name: "Curso Completo de Marketing Digital",
    category: "Marketing Digital",
    price: "R$ 997,00",
    benefits: [
      "Página de Vendas Profissional",
      "Checkout Personalizado",
      "Upsell Estratégico",
      "Order Bump",
      "Comunidade de Afiliados",
      "Material de Divulgação",
      "Treinamento Completo",
      "Suporte 24/7"
    ],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    rank: 2,
    name: "Copywriting Avançado",
    category: "Redação",
    price: "R$ 497,00",
    benefits: [
      "Página de Vendas Profissional",
      "Checkout Personalizado",
      "Material de Divulgação",
      "Treinamento Completo",
      "Suporte 24/7"
    ],
    image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
  },
  // Adicione mais produtos aqui...
];

const allBenefits = [
  "Página de Vendas Profissional",
  "Checkout Personalizado",
  "Upsell Estratégico",
  "Order Bump",
  "Comunidade de Afiliados",
  "Material de Divulgação",
  "Treinamento Completo",
  "Suporte 24/7"
];

const MostComplete = () => {
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
            <Check className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Produtos Mais Completos
              </h1>
              <p className="text-gray-600 mt-1">
                Descubra os produtos com mais benefícios para afiliados
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

      {/* Lista de Produtos em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Imagem e Badge de Ranking */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {product.rank}º Lugar
              </div>
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
            </div>

            {/* Informações do Produto */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Categoria */}
              <div className="mb-3">
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Nome do Produto */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4 line-clamp-2">
                {product.name}
              </h2>

              {/* Preço */}
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-gray-500">Preço</p>
                <p className="font-semibold text-gray-800">{product.price}</p>
              </div>

              {/* Benefícios */}
              <div className="space-y-3 mb-6 flex-1">
                <p className="text-sm text-gray-500">Benefícios:</p>
                <div className="space-y-2">
                  {allBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {product.benefits.includes(benefit) ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <p className="text-sm text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de Afiliação */}
              <div className="mt-auto">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Afiliar-se Agora</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MostComplete; 