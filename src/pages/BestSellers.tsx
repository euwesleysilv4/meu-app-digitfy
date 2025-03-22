import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, Users as UsersIcon, Instagram } from "lucide-react";

interface Product {
  rank: number;
  name: string;
  category: string;
  price: string;
  sales: number;
  revenue: string;
  image: string;
  affiliatesCount: number;
  topAffiliate: {
    name: string;
    instagram: string;
    profileImage: string;
    sales: number;
  };
}

const products: Product[] = [
  {
    rank: 1,
    name: "Curso Completo de Marketing Digital",
    category: "Marketing Digital",
    price: "R$ 997,00",
    sales: 1250,
    revenue: "R$ 1.246.250,00",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 328,
    topAffiliate: {
      name: "João Silva",
      instagram: "@joaosilva.digital",
      profileImage: "https://i.pravatar.cc/150?img=1",
      sales: 150
    }
  },
  {
    rank: 2,
    name: "Copywriting Avançado",
    category: "Redação",
    price: "R$ 497,00",
    sales: 980,
    revenue: "R$ 487.060,00",
    image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 215,
    topAffiliate: {
      name: "Maria Santos",
      instagram: "@mariasantos.mkt",
      profileImage: "https://i.pravatar.cc/150?img=2",
      sales: 120
    }
  },
  {
    rank: 3,
    name: "Tráfego Pago Master",
    category: "Publicidade",
    price: "R$ 1.297,00",
    sales: 850,
    revenue: "R$ 1.102.450,00",
    image: "https://images.unsplash.com/photo-1523961131990-5b951f9d6d6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 187,
    topAffiliate: {
      name: "Pedro Costa",
      instagram: "@pedrocosta.oficial",
      profileImage: "https://i.pravatar.cc/150?img=3",
      sales: 95
    }
  },
  {
    rank: 4,
    name: "Design Gráfico Profissional",
    category: "Design",
    price: "R$ 697,00",
    sales: 720,
    revenue: "R$ 501.840,00",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 156,
    topAffiliate: {
      name: "Ana Oliveira",
      instagram: "@anaoliveira.digital",
      profileImage: "https://i.pravatar.cc/150?img=4",
      sales: 80
    }
  },
  {
    rank: 5,
    name: "E-commerce Completo",
    category: "Vendas Online",
    price: "R$ 1.497,00",
    sales: 680,
    revenue: "R$ 1.017.960,00",
    image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 142,
    topAffiliate: {
      name: "Lucas Mendes",
      instagram: "@lucasmendes.mkt",
      profileImage: "https://i.pravatar.cc/150?img=5",
      sales: 75
    }
  },
  {
    rank: 6,
    name: "Fotografia Profissional",
    category: "Fotografia",
    price: "R$ 597,00",
    sales: 650,
    revenue: "R$ 388.050,00",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 128,
    topAffiliate: {
      name: "Carla Souza",
      instagram: "@carlasouza.afiliada",
      profileImage: "https://i.pravatar.cc/150?img=6",
      sales: 70
    }
  },
  {
    rank: 7,
    name: "Edição de Vídeos",
    category: "Produção de Vídeos",
    price: "R$ 797,00",
    sales: 620,
    revenue: "R$ 494.140,00",
    image: "https://images.unsplash.com/photo-1579803815615-1203fb5a2e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 115,
    topAffiliate: {
      name: "Rafael Lima",
      instagram: "@rafaellima.digital",
      profileImage: "https://i.pravatar.cc/150?img=7",
      sales: 65
    }
  },
  {
    rank: 8,
    name: "Gestão de Redes Sociais",
    category: "Social Media",
    price: "R$ 397,00",
    sales: 600,
    revenue: "R$ 238.200,00",
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 108,
    topAffiliate: {
      name: "Julia Ferreira",
      instagram: "@juliaferreira.mkt",
      profileImage: "https://i.pravatar.cc/150?img=8",
      sales: 60
    }
  },
  {
    rank: 9,
    name: "Email Marketing Avançado",
    category: "Marketing Digital",
    price: "R$ 297,00",
    sales: 580,
    revenue: "R$ 172.260,00",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 102,
    topAffiliate: {
      name: "Bruno Santos",
      instagram: "@brunosantos.oficial",
      profileImage: "https://i.pravatar.cc/150?img=9",
      sales: 55
    }
  },
  {
    rank: 10,
    name: "Produção de Conteúdo",
    category: "Criação de Conteúdo",
    price: "R$ 497,00",
    sales: 550,
    revenue: "R$ 273.350,00",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    affiliatesCount: 98,
    topAffiliate: {
      name: "Mariana Costa",
      instagram: "@marianacosta.digital",
      profileImage: "https://i.pravatar.cc/150?img=10",
      sales: 50
    }
  }
];

const BestSellers = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Compacto em Duas Colunas */}
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
            <TrendingUp className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Produtos Mais Vendidos
              </h1>
              <p className="text-gray-600 mt-1">
                Descubra os produtos que estão gerando mais resultados
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

              {/* Métricas Simplificadas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Preço</p>
                  <p className="font-semibold text-gray-800">{product.price}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Vendas</p>
                  <p className="font-semibold text-emerald-600">{product.sales}</p>
                </div>
              </div>

              {/* Divisor */}
              <div className="h-px bg-gray-100 mb-6" />

              {/* Top Afiliado com Vendas */}
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Top Afiliado</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.topAffiliate.profileImage}
                      alt={product.topAffiliate.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-100"
                    />
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">{product.topAffiliate.name}</p>
                      <p className="text-sm text-emerald-600">{product.topAffiliate.instagram}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Vendas</p>
                    <p className="font-semibold text-emerald-600">{product.topAffiliate.sales}</p>
                  </div>
                </div>
              </div>

              {/* Botão de Afiliação */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300 mt-6"
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

export default BestSellers; 