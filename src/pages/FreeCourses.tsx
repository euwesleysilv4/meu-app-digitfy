import { motion } from "framer-motion";
import { BookOpen, Clock, Video, FileText } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'artigo' | 'curso';
  duration: string;
  image: string;
  link: string;
}

const courses: Course[] = [
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
  // Adicione mais cursos aqui...
];

const FreeCourses = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Atualizado */}
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

      {/* Feed de Cursos */}
      <div className="space-y-6">
        {courses.map((course, index) => (
          <motion.a
            key={course.id}
            href={course.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="grid md:grid-cols-12 gap-6">
              {/* Imagem */}
              <div className="md:col-span-4 relative aspect-[4/3] overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                  }}
                />
              </div>

              {/* Informações */}
              <div className="md:col-span-8 p-6">
                {/* Tipo e Duração */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    {course.type === 'video' && <Video className="w-4 h-4" />}
                    {course.type === 'artigo' && <FileText className="w-4 h-4" />}
                    {course.type === 'curso' && <BookOpen className="w-4 h-4" />}
                    <span>{course.type === 'video' ? 'Vídeo' : course.type === 'artigo' ? 'Artigo' : 'Curso'}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Título e Descrição */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {course.title}
                </h2>
                <p className="text-gray-600 line-clamp-3">
                  {course.description}
                </p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default FreeCourses; 