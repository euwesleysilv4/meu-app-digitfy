import { motion } from "framer-motion";
import { User, Check, Instagram, Sparkles, LayoutGrid, ArrowRight, Briefcase, Video, Star, Code } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    id: 1,
    name: "Empreendedores",
    icon: Briefcase,
    description: "Perfil ideal para quem quer vender produtos ou serviços.",
    steps: [
      {
        title: "Definição do Nicho",
        content: "Escolha um nicho específico e defina seu público-alvo. Isso ajudará a criar conteúdo direcionado e aumentar o engajamento."
      },
      {
        title: "Criação da Bio",
        content: "Sua bio deve ser clara, concisa e destacar o que você oferece. Inclua um call-to-action e links relevantes."
      },
      {
        title: "Design do Perfil",
        content: "Mantenha um design consistente com cores e fontes que reflitam sua marca. Use highlights para organizar seu conteúdo."
      },
      {
        title: "Conteúdo Estratégico",
        content: "Crie conteúdo que agregue valor ao seu público. Use diferentes formatos como posts, stories e reels."
      },
      {
        title: "Engajamento",
        content: "Interaja com seu público respondendo comentários, mensagens e participando de discussões relevantes."
      }
    ]
  },
  {
    id: 2,
    name: "Criadores de Conteúdo",
    icon: Video,
    description: "Estrutura para quem produz conteúdo digital.",
    steps: [
      {
        title: "Definição do Nicho",
        content: "Escolha um nicho específico e defina seu público-alvo. Isso ajudará a criar conteúdo direcionado e aumentar o engajamento."
      },
      {
        title: "Criação da Bio",
        content: "Sua bio deve ser clara, concisa e destacar o que você oferece. Inclua um call-to-action e links relevantes."
      },
      // Adicione mais passos para esta categoria
    ]
  },
  {
    id: 3,
    name: "Influenciadores",
    icon: Star,
    description: "Perfil para quem quer crescer como influenciador.",
    steps: [
      {
        title: "Definição do Nicho",
        content: "Escolha um nicho específico e defina seu público-alvo. Isso ajudará a criar conteúdo direcionado e aumentar o engajamento."
      },
      {
        title: "Criação da Bio",
        content: "Sua bio deve ser clara, concisa e destacar o que você oferece. Inclua um call-to-action e links relevantes."
      },
      // Adicione mais passos para esta categoria
    ]
  },
  {
    id: 4,
    name: "Profissionais Liberais",
    icon: Code,
    description: "Estrutura para profissionais que oferecem serviços.",
    steps: [
      {
        title: "Definição do Nicho",
        content: "Escolha um nicho específico e defina seu público-alvo. Isso ajudará a criar conteúdo direcionado e aumentar o engajamento."
      },
      {
        title: "Criação da Bio",
        content: "Sua bio deve ser clara, concisa e destacar o que você oferece. Inclua um call-to-action e links relevantes."
      },
      // Adicione mais passos para esta categoria
    ]
  }
];

const ProfileStructure = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <User className="w-10 h-10 text-emerald-500" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Estrutura de Perfil
              </h1>
              <p className="text-gray-600 mt-1">
                Aprenda a estruturar um perfil de vendas no Instagram passo a passo
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

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            <span>Categorias</span>
          </h2>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <motion.li
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedStep(0);
                }}
                className={`flex items-center gap-3 text-sm text-gray-600 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedCategory.id === category.id
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-emerald-50 rounded-lg"
                >
                  <category.icon className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Coluna Direita - Conteúdo */}
        <div className="lg:col-span-2">
          {/* Índice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-emerald-600 mb-4">Índice</h2>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => setSelectedStep(index)}
                  className={`flex items-center gap-2 text-sm text-gray-600 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedStep === index
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span>{index + 1}</span>
                  <span>{step.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Passo a Passo Completo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-emerald-600 mb-4">Passo a Passo Completo</h2>
            
            {/* Seção Atual */}
            <motion.div
              key={selectedStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedStep + 1}. {selectedCategory.steps[selectedStep].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedCategory.steps[selectedStep].content}
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Instagram className="w-4 h-4" />
                <span>Dica: Use ferramentas de análise para entender seu público.</span>
              </div>
            </motion.div>

            {/* Navegação */}
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedStep(prev => Math.max(prev - 1, 0))}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                onClick={() => setSelectedStep(prev => Math.min(prev + 1, selectedCategory.steps.length - 1))}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStructure; 