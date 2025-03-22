import { motion } from "framer-motion";
import { BookOpen, Clock, Video, FileText } from "lucide-react";

interface Content {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'artigo' | 'curso';
  duration: string;
  image: string;
  link: string;
}

const contents: Content[] = [
  {
    id: 1,
    title: "Introdução ao Marketing Digital",
    description: "Aprenda os conceitos básicos do marketing digital e como aplicá-los no seu negócio.",
    type: 'video',
    duration: '15 min',
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    link: "#"
  },
  {
    id: 2,
    title: "Guia Completo de Copywriting",
    description: "Descubra como escrever textos persuasivos que convertem.",
    type: 'artigo',
    duration: '10 min',
    image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    link: "#"
  },
  // Adicione mais conteúdos aqui...
];

const RelevantContent = () => {
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
            <BookOpen className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Conteúdos Relevantes
              </h1>
              <p className="text-gray-600 mt-1">
                Acesse materiais gratuitos e melhore suas habilidades
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

      {/* Feed de Conteúdos em Grid de 4 Colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {contents.map((content, index) => (
          <motion.a
            key={content.id}
            href={content.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            {/* Imagem */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={content.image} 
                alt={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
            </div>

            {/* Informações */}
            <div className="p-4">
              {/* Tipo e Duração */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {content.type === 'video' && <Video className="w-3 h-3" />}
                  {content.type === 'artigo' && <FileText className="w-3 h-3" />}
                  {content.type === 'curso' && <BookOpen className="w-3 h-3" />}
                  <span>{content.type === 'video' ? 'Vídeo' : content.type === 'artigo' ? 'Artigo' : 'Curso'}</span>
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{content.duration}</span>
                </div>
              </div>

              {/* Título e Descrição */}
              <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                {content.title}
              </h2>
              <p className="text-xs text-gray-600 line-clamp-2">
                {content.description}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default RelevantContent; 