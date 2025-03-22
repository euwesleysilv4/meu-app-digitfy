import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Instagram, Crown, Star, ArrowRight, TrendingUp, Users, Target, Award } from 'lucide-react';

interface Affiliate {
  rank: number;
  name: string;
  instagram: string;
  profileImage: string;
  sales: number;
  commission: string;
  isTop5: boolean;
}

const affiliates: Affiliate[] = [
  {
    rank: 1,
    name: "João Silva",
    instagram: "@joaosilva.digital",
    profileImage: "https://i.pravatar.cc/150?img=1",
    sales: 1250,
    commission: "R$ 125.000,00",
    isTop5: true
  },
  {
    rank: 2,
    name: "Maria Santos",
    instagram: "@mariasantos.mkt",
    profileImage: "https://i.pravatar.cc/150?img=2",
    sales: 1180,
    commission: "R$ 118.000,00",
    isTop5: true
  },
  {
    rank: 3,
    name: "Pedro Costa",
    instagram: "@pedrocosta.oficial",
    profileImage: "https://i.pravatar.cc/150?img=3",
    sales: 1050,
    commission: "R$ 105.000,00",
    isTop5: true
  },
  {
    rank: 4,
    name: "Ana Oliveira",
    instagram: "@anaoliveira.digital",
    profileImage: "https://i.pravatar.cc/150?img=4",
    sales: 980,
    commission: "R$ 98.000,00",
    isTop5: true
  },
  {
    rank: 5,
    name: "Lucas Mendes",
    instagram: "@lucasmendes.mkt",
    profileImage: "https://i.pravatar.cc/150?img=5",
    sales: 920,
    commission: "R$ 92.000,00",
    isTop5: true
  },
  {
    rank: 6,
    name: "Carla Souza",
    instagram: "@carlasouza.afiliada",
    profileImage: "https://i.pravatar.cc/150?img=6",
    sales: 850,
    commission: "R$ 85.000,00",
    isTop5: false
  },
  {
    rank: 7,
    name: "Rafael Lima",
    instagram: "@rafaellima.digital",
    profileImage: "https://i.pravatar.cc/150?img=7",
    sales: 820,
    commission: "R$ 82.000,00",
    isTop5: false
  },
  {
    rank: 8,
    name: "Julia Ferreira",
    instagram: "@juliaferreira.mkt",
    profileImage: "https://i.pravatar.cc/150?img=8",
    sales: 780,
    commission: "R$ 78.000,00",
    isTop5: false
  },
  {
    rank: 9,
    name: "Bruno Santos",
    instagram: "@brunosantos.oficial",
    profileImage: "https://i.pravatar.cc/150?img=9",
    sales: 750,
    commission: "R$ 75.000,00",
    isTop5: false
  },
  {
    rank: 10,
    name: "Mariana Costa",
    instagram: "@marianacosta.digital",
    profileImage: "https://i.pravatar.cc/150?img=10",
    sales: 720,
    commission: "R$ 72.000,00",
    isTop5: false
  },
  // ... adicione mais 20-30 afiliados aqui com dados similares
];

const TopAffiliates = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Animado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <Trophy className="w-8 h-8 text-emerald-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Top Afiliados
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg mb-6"
            >
              Conheça os afiliados que estão revolucionando o mercado digital e gerando resultados extraordinários
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8"
            >
              <div className="text-center">
                <span className="block text-2xl font-bold text-emerald-600">Top 5</span>
                <span className="text-sm text-gray-500">Destaque</span>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className="text-center">
                <span className="block text-2xl font-bold text-emerald-600">Mensal</span>
                <span className="text-sm text-gray-500">Atualização</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Coluna Direita */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col justify-center items-center md:items-end"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-right"
            >
              <div className="mb-2">
                <span className="text-4xl font-bold text-emerald-600">
                  +R$ 1.5M
                </span>
              </div>
              <p className="text-gray-500">em comissões este mês</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center gap-3"
            >
              <span className="text-sm text-gray-500">
                Última atualização: 
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Top 5 em Destaque */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12"
      >
        {/* 1º Lugar */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1.05 }}
          className="relative lg:col-start-1"
        >
          <div className="bg-gradient-to-b from-emerald-50 to-white rounded-2xl p-6 border border-emerald-200 h-full shadow-lg shadow-emerald-100">
            <div className="absolute -top-4 -right-4">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-500 rounded-full text-sm font-medium mb-4">
              1º Lugar
            </span>
            <img
              src={affiliates[0].profileImage}
              alt={affiliates[0].name}
              className="w-24 h-24 rounded-full border-4 border-emerald-200 mb-4"
            />
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{affiliates[0].name}</h3>
            <p className="text-emerald-500 mb-2">{affiliates[0].instagram}</p>
            <p className="text-sm text-gray-500 mb-4">{affiliates[0].commission}</p>
            <a
              href={`https://instagram.com/${affiliates[0].instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              <Instagram className="w-4 h-4" />
              <span>Seguir</span>
            </a>
          </div>
        </motion.div>

        {/* 2º Lugar */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative lg:col-start-2"
        >
          <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-6 border-2 border-emerald-200 h-full shadow-md shadow-emerald-100/50">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium mb-4">
              2º Lugar
            </span>
            <img
              src={affiliates[1].profileImage}
              alt={affiliates[1].name}
              className="w-20 h-20 rounded-full border-4 border-emerald-100 mb-4"
            />
            <h3 className="font-semibold text-gray-800 mb-1">{affiliates[1].name}</h3>
            <p className="text-emerald-600 mb-2">{affiliates[1].instagram}</p>
            <p className="text-sm text-gray-500 mb-4">{affiliates[1].commission}</p>
            <a
              href={`https://instagram.com/${affiliates[1].instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              <Instagram className="w-4 h-4" />
              <span>Seguir</span>
            </a>
          </div>
        </motion.div>

        {/* 3º Lugar */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative lg:col-start-3"
        >
          <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-6 border-2 border-emerald-200 h-full shadow-md shadow-emerald-100/50">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium mb-4">
              3º Lugar
            </span>
            <img
              src={affiliates[2].profileImage}
              alt={affiliates[2].name}
              className="w-20 h-20 rounded-full border-4 border-emerald-100 mb-4"
            />
            <h3 className="font-semibold text-gray-800 mb-1">{affiliates[2].name}</h3>
            <p className="text-emerald-600 mb-2">{affiliates[2].instagram}</p>
            <p className="text-sm text-gray-500 mb-4">{affiliates[2].commission}</p>
            <a
              href={`https://instagram.com/${affiliates[2].instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              <Instagram className="w-4 h-4" />
              <span>Seguir</span>
            </a>
          </div>
        </motion.div>

        {/* 4º e 5º lugares */}
        {[4, 5].map((position, index) => (
          <motion.div
            key={position}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + (index * 0.2) }}
            className="relative lg:col-start-${position}"
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-100 h-full">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium mb-4">
                {position}º Lugar
              </span>
              <img
                src={affiliates[position-1].profileImage}
                alt={affiliates[position-1].name}
                className="w-20 h-20 rounded-full border-4 border-gray-100 mb-4"
              />
              <h3 className="font-semibold text-gray-800 mb-1">{affiliates[position-1].name}</h3>
              <p className="text-gray-600 mb-2">{affiliates[position-1].instagram}</p>
              <p className="text-sm text-gray-500 mb-4">{affiliates[position-1].commission}</p>
              <a
                href={`https://instagram.com/${affiliates[position-1].instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
                <span>Seguir</span>
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lista Completa com Paginação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Ranking Completo</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {affiliates.slice(5).map((affiliate, index) => (
            <motion.div
              key={affiliate.instagram}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
            >
              {/* Posição e Informações do Afiliado */}
              <div className="flex items-start md:items-center space-x-4 mb-4 md:mb-0">
                <div className="w-8 md:w-12 flex-shrink-0 text-center">
                  <span className="text-lg md:text-2xl font-bold text-gray-400">
                    {affiliate.rank}º
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 mb-2 md:mb-0">
                    <img
                      src={affiliate.profileImage}
                      alt={affiliate.name}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-base md:text-lg">
                      {affiliate.name}
                    </h3>
                    <p className="text-emerald-600 text-sm md:text-base">
                      {affiliate.instagram}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas e Botão */}
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6">
                <div className="flex justify-between md:justify-start items-center gap-4 md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500">Vendas</p>
                    <p className="font-semibold text-gray-800">{affiliate.sales}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500">Comissão</p>
                    <p className="font-semibold text-emerald-600">{affiliate.commission}</p>
                  </div>
                </div>
                
                <a
                  href={`https://instagram.com/${affiliate.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm md:text-base"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Seguir</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paginação Responsiva */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:px-6 md:py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3 md:mb-0">
            Mostrando {affiliates.length} afiliados
          </p>
          <div className="flex space-x-2">
            <button className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Anterior
            </button>
            <button className="px-3 md:px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600">
              Próxima
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TopAffiliates; 