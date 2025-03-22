import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Image, Edit, Video, Search, 
  PieChart, Palette, Music, Code, Mail
} from 'lucide-react';

interface UsefulSite {
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  favicon: string;
}

const originalSites: UsefulSite[] = [
  {
    title: "Canva",
    description: "Crie designs profissionais gratuitamente: posts, apresentações, banners e mais",
    url: "https://www.canva.com",
    category: "Design",
    tags: ["design", "social media", "templates"],
    favicon: "https://www.canva.com/favicon.ico"
  },
  {
    title: "Remove.bg",
    description: "Remova o fundo de imagens automaticamente em segundos",
    url: "https://www.remove.bg",
    category: "Design",
    tags: ["imagens", "edição", "background"],
    favicon: "https://www.remove.bg/favicon.ico"
  },
  {
    title: "ChatGPT",
    description: "IA para criação de textos, roteiros e ideias para seu conteúdo",
    url: "https://chat.openai.com",
    category: "Criação de Conteúdo",
    tags: ["IA", "copywriting", "ideias"],
    favicon: "https://chat.openai.com/favicon.ico"
  },
  {
    title: "Semrush",
    description: "Pesquisa de palavras-chave e análise de concorrentes",
    url: "https://www.semrush.com",
    category: "Marketing",
    tags: ["SEO", "keywords", "análise"],
    favicon: "https://www.semrush.com/favicon.ico"
  },
  {
    title: "Google Analytics",
    description: "Análise completa do tráfego e comportamento do seu site",
    url: "https://analytics.google.com",
    category: "Analytics",
    tags: ["métricas", "análise", "tráfego"],
    favicon: "https://analytics.google.com/favicon.ico"
  }
];

const moreSites = [
  {
    title: "Unsplash",
    description: "Banco de imagens gratuitas em alta resolução",
    url: "https://unsplash.com",
    category: "Mídia",
    tags: ["imagens", "fotos", "gratuito"],
    favicon: "https://unsplash.com/favicon.ico"
  },
  {
    title: "Notion",
    description: "Organize seus projetos, notas e documentos em um só lugar",
    url: "https://www.notion.so",
    category: "Produtividade",
    tags: ["organização", "notas", "projetos"],
    favicon: "https://www.notion.so/favicon.ico"
  },
  {
    title: "Figma",
    description: "Ferramenta de design colaborativo para interfaces e protótipos",
    url: "https://www.figma.com",
    category: "Design",
    tags: ["UI/UX", "protótipo", "design"],
    favicon: "https://www.figma.com/favicon.ico"
  },
  {
    title: "Mailchimp",
    description: "Plataforma de email marketing e automação",
    url: "https://mailchimp.com",
    category: "Marketing",
    tags: ["email", "automação", "newsletter"],
    favicon: "https://mailchimp.com/favicon.ico"
  },
  {
    title: "Hotjar",
    description: "Análise de comportamento do usuário e mapas de calor",
    url: "https://www.hotjar.com",
    category: "Analytics",
    tags: ["UX", "análise", "comportamento"],
    favicon: "https://www.hotjar.com/favicon.ico"
  },
  {
    title: "Storyset",
    description: "Ilustrações personalizáveis e gratuitas para seus projetos",
    url: "https://storyset.com",
    category: "Design",
    tags: ["ilustrações", "gráficos", "gratuito"],
    favicon: "https://storyset.com/favicon.ico"
  },
  {
    title: "Adarsus",
    description: "Remova metadados de documentos, imagens e vídeos online",
    url: "https://www.adarsus.com/en/remove-metadata-online-document-image-video",
    category: "Utilidades",
    tags: ["privacidade", "metadados", "segurança"],
    favicon: "https://www.adarsus.com/favicon.ico"
  },
  {
    title: "Adobe Podcast",
    description: "Aprimoramento de áudio para podcasts com IA",
    url: "https://podcast.adobe.com/enhance",
    category: "Áudio",
    tags: ["podcast", "áudio", "edição"],
    favicon: "https://podcast.adobe.com/favicon.ico"
  },
  {
    title: "PhotoRoom",
    description: "Remova fundos de imagens facilmente com inteligência artificial",
    url: "https://www.photoroom.com/pt-br/ferramentas/remover-fundo-de-imagem",
    category: "Design",
    tags: ["imagens", "edição", "background"],
    favicon: "https://www.photoroom.com/favicon.ico"
  },
  {
    title: "iLoveIMG",
    description: "Comprima imagens PNG mantendo qualidade",
    url: "https://www.iloveimg.com/pt/comprimir-imagem/comprimir-png",
    category: "Utilidades",
    tags: ["imagens", "compressão", "otimização"],
    favicon: "https://www.iloveimg.com/favicon.ico"
  },
  {
    title: "DIY Book Covers",
    description: "Crie mockups 3D para livros e produtos",
    url: "https://diybookcovers.com/3Dmockups",
    category: "Design",
    tags: ["mockup", "livros", "3D"],
    favicon: "https://diybookcovers.com/favicon.ico"
  },
  {
    title: "ElevenLabs",
    description: "Geração de vozes realistas com IA para narrações e dublagens",
    url: "https://elevenlabs.io",
    category: "Áudio",
    tags: ["IA", "voz", "narração"],
    favicon: "https://elevenlabs.io/favicon.ico"
  },
  {
    title: "2Short.ai",
    description: "Crie shorts de YouTube, TikToks e Reels com IA a partir de vídeos longos",
    url: "https://2short.ai",
    category: "Vídeo",
    tags: ["IA", "shorts", "conteúdo"],
    favicon: "https://2short.ai/favicon.ico"
  },
  {
    title: "Designrr",
    description: "Crie eBooks, PDFs e flipbooks a partir de conteúdo existente em minutos",
    url: "https://designrr.io",
    category: "Criação de Conteúdo",
    tags: ["eBooks", "PDF", "conversão"],
    favicon: "https://designrr.io/favicon.ico"
  },
  {
    title: "Mapify",
    description: "Crie mapas mentais com IA a partir de vídeos, PDFs e documentos",
    url: "https://mapify.so/pt",
    category: "Criação de Conteúdo",
    tags: ["IA", "mapas mentais", "resumo"],
    favicon: "https://mapify.so/favicon.ico"
  },
  {
    title: "UI Verse",
    description: "Biblioteca gratuita de elementos de UI em HTML e CSS para seu projeto",
    url: "https://uiverse.io",
    category: "Design",
    tags: ["UI", "CSS", "componentes"],
    favicon: "https://uiverse.io/favicon.ico"
  },
  {
    title: "mailto:link",
    description: "Gerador de links para email com assunto e corpo pré-configurados",
    url: "https://mailtolink.me",
    category: "Utilidades",
    tags: ["email", "marketing", "link"],
    favicon: "https://mailtolink.me/favicon.ico"
  },
  {
    title: "Flaticon",
    description: "Banco de ícones gratuitos para seus projetos e designs",
    url: "https://www.flaticon.com/br",
    category: "Design",
    tags: ["ícones", "design", "gratuito"],
    favicon: "https://www.flaticon.com/favicon.ico"
  },
  {
    title: "Yandex",
    description: "Motor de busca alternativo com recursos de pesquisa e tradução",
    url: "https://yandex.com",
    category: "Pesquisa",
    tags: ["busca", "pesquisa", "alternativa"],
    favicon: "https://yandex.com/favicon.ico"
  },
  {
    title: "Freepik",
    description: "Recursos gráficos gratuitos para designers: fotos, vetores e mockups",
    url: "https://www.freepik.com",
    category: "Design",
    tags: ["vetores", "imagens", "gratuito"],
    favicon: "https://www.freepik.com/favicon.ico"
  },
  {
    title: "ManyChat",
    description: "Plataforma para criar e gerenciar chatbots para marketing",
    url: "https://manychat.com",
    category: "Marketing",
    tags: ["chatbot", "automação", "mensagens"],
    favicon: "https://manychat.com/favicon.ico"
  },
  {
    title: "Fliki",
    description: "Transforme texto em vídeos narrados com vozes realistas",
    url: "https://fliki.ai",
    category: "Vídeo",
    tags: ["IA", "narração", "vídeo"],
    favicon: "https://fliki.ai/favicon.ico"
  },
  {
    title: "Mixo",
    description: "Crie sites e landing pages de alta conversão rapidamente",
    url: "https://www.mixo.io",
    category: "Web",
    tags: ["landing page", "website", "sem código"],
    favicon: "https://www.mixo.io/favicon.ico"
  },
  {
    title: "Gamma",
    description: "Crie apresentações profissionais com IA em minutos",
    url: "https://gamma.app/pt-br",
    category: "Apresentações",
    tags: ["IA", "apresentações", "slides"],
    favicon: "https://gamma.app/favicon.ico"
  },
  {
    title: "Facebook Ads Library",
    description: "Biblioteca de anúncios do Facebook para pesquisar e analisar campanhas",
    url: "https://www.facebook.com/ads/library",
    category: "Marketing",
    tags: ["anúncios", "pesquisa", "referência"],
    favicon: "https://www.facebook.com/favicon.ico"
  },
  {
    title: "Jitter",
    description: "Crie animações e efeitos visuais incríveis para seus designs",
    url: "https://jitter.video/?noredir=1",
    category: "Design",
    tags: ["animação", "efeitos", "movimento"],
    favicon: "https://jitter.video/favicon.ico"
  },
  {
    title: "VideoBolt",
    description: "Crie intros, outros e animações para seus vídeos online",
    url: "https://videobolt.net/br",
    category: "Vídeo",
    tags: ["intros", "animação", "vídeo"],
    favicon: "https://videobolt.net/favicon.ico"
  }
];

const sites = [...originalSites, ...moreSites];

const categories = Array.from(new Set(sites.map(site => site.category)));

const UsefulSites = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSites = sites.filter(site => {
    const matchesCategory = !selectedCategory || site.category === selectedCategory;
    const matchesSearch = site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Cabeçalho */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
          <Globe className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Sites Úteis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Uma coleção cuidadosamente selecionada de ferramentas e recursos para impulsionar seu negócio digital
        </p>
      </motion.div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${!selectedCategory 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'}
            `}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedCategory === category 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'}
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site, index) => (
          <motion.a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                <img 
                  src={site.favicon} 
                  alt={`${site.title} icon`}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">{site.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{site.description}</p>
                <div className="flex flex-wrap gap-2">
                  {site.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default UsefulSites; 