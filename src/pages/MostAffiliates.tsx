import { motion } from "framer-motion";
import { Users as UsersIcon, ShoppingBag } from "lucide-react";

interface Product {
  rank: number;
  name: string;
  category: string;
  price: string;
  affiliatesCount: number;
  image: string;
}

const products: Product[] = [
  {
    rank: 1,
    name: "Curso Completo de Marketing Digital",
    category: "Marketing Digital",
    price: "R$ 997,00",
    affiliatesCount: 328,
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    rank: 2,
    name: "Copywriting Avançado",
    category: "Redação",
    price: "R$ 497,00",
    affiliatesCount: 215,
    image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    rank: 3,
    name: "Tráfego Pago Master",
    category: "Publicidade",
    price: "R$ 1.297,00",
    affiliatesCount: 187,
    image: "https://images.unsplash.com/photo-1523961131990-5b951f9d6d6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
  },
  // Adicione mais produtos aqui...
];

const MostAffiliates = () => {
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
            <UsersIcon className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Produtos com Mais Afiliados
              </h1>
              <p className="text-gray-600 mt-1">
                Descubra os produtos que mais atraem afiliados
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
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
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
            <div className="p-6">
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

              {/* Destaque para Afiliados */}
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-lg mb-6">
                <div>
                  <p className="text-sm text-gray-500">Afiliados</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {product.affiliatesCount}
                  </p>
                </div>
                <UsersIcon className="w-8 h-8 text-emerald-500" />
              </div>

              {/* Preço */}
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-gray-500">Preço</p>
                <p className="font-semibold text-gray-800">{product.price}</p>
              </div>

              {/* Botão de Afiliação */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Afiliar-se Agora</span>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MostAffiliates; 