import { motion } from "framer-motion";
import { Link2, Database, FileText, Globe, Image, Users, Book, Map, Target, MessageSquare, Disc, Megaphone } from "lucide-react";

interface LinkItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  url: string;
  accessCount: number;
}

const links: LinkItem[] = [
  {
    id: 1,
    title: "Links da Comunidade",
    description: "Acesse os links compartilhados pela comunidade.",
    icon: Database,
    url: "/links/community-links",
    accessCount: 1200
  },
  {
    id: 2,
    title: "Google Drive",
    description: "Acesse documentos e recursos compartilhados no Google Drive.",
    icon: FileText,
    url: "/links/google-drive",
    accessCount: 950
  },
  {
    id: 3,
    title: "Sites Úteis",
    description: "Lista de sites recomendados para afiliados.",
    icon: Globe,
    url: "/tools/useful-sites",
    accessCount: 800
  },
  {
    id: 4,
    title: "Criativos Personalizados",
    description: "Acesse criativos para suas campanhas.",
    icon: Image,
    url: "/tools/custom-creatives",
    accessCount: 750
  },
  {
    id: 5,
    title: "Área do Afiliado",
    description: "Acesse a área exclusiva para afiliados.",
    icon: Users,
    url: "/affiliate",
    accessCount: 700
  },
  {
    id: 6,
    title: "Aprendizado",
    description: "Cursos, ebooks e mapas mentais para afiliados.",
    icon: Book,
    url: "/learning",
    accessCount: 650
  },
  {
    id: 7,
    title: "Mapas Mentais",
    description: "Acesse mapas mentais para estratégias de vendas.",
    icon: Map,
    url: "/learning/mind-maps",
    accessCount: 600
  },
  {
    id: 8,
    title: "Estratégia de Vendas",
    description: "Dicas e estratégias para aumentar suas vendas.",
    icon: Target,
    url: "/learning/sales-strategy",
    accessCount: 550
  },
  {
    id: 9,
    title: "Grupos de WhatsApp",
    description: "Participe de grupos de discussão no WhatsApp.",
    icon: MessageSquare,
    url: "/community/whatsapp",
    accessCount: 500
  },
  {
    id: 10,
    title: "Servidores no Discord",
    description: "Junte-se a servidores de discussão no Discord.",
    icon: Disc,
    url: "/community/discord",
    accessCount: 450
  },
  {
    id: 11,
    title: "Divulgue sua Comunidade",
    description: "Divulgue sua comunidade na plataforma.",
    icon: Megaphone,
    url: "/community/promote",
    accessCount: 400
  }
];

const Links = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4">
          <Link2 className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Links Mais Acessados
            </h1>
            <p className="text-gray-600 mt-1">
              Confira os links mais populares da plataforma
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid de Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                  {link.title}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {link.description}
              </p>
            </div>

            {/* Rodapé com Acessos e Botão */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Acessos:</span>
                  <span className="font-semibold text-emerald-600">{link.accessCount}</span>
                </div>
                <a
                  href={link.url}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Acessar</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Links;
