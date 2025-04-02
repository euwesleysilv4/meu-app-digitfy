import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Link as LinkIcon, 
  MapPin, 
  Camera,
  Wand2,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ProfileStructure {
  username: string;
  displayName: string;
  bio: string;
  category: string;
  location: string;
  link: string;
  posts: number;
  followers: number;
  following: number;
  profileImage: string;
  bioPreference?: string;
}

interface Niche {
  value: string;
  label: string;
  subtopics: Array<{
    value: string;
    label: string;
  }>;
}

const ProfileStructureGenerator = () => {
  const [profile, setProfile] = useState<ProfileStructure>({
    username: 'username',
    displayName: 'Nome Completo',
    bio: 'Bio do perfil',
    category: 'Categoria Profissional',
    location: 'Cidade, Estado',
    link: 'seusite.com.br',
    posts: 84,
    followers: 1134,
    following: 513,
    profileImage: '',
    bioPreference: ''
  });

  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [bioCopied, setBioCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok'>('instagram');

  const niches: Niche[] = [
    {
      value: 'marketing',
      label: 'Marketing Digital',
      subtopics: [
        { value: 'traffic', label: 'Tráfego Pago' },
        { value: 'social', label: 'Social Media' },
        { value: 'content', label: 'Marketing de Conteúdo' },
        { value: 'seo', label: 'SEO' },
        { value: 'email', label: 'Email Marketing' },
        { value: 'growth', label: 'Growth Hacking' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'inbound', label: 'Inbound Marketing' },
        { value: 'analytics', label: 'Analytics e Dados' }
      ]
    },
    {
      value: 'design',
      label: 'Design e Criação',
      subtopics: [
        { value: 'ui', label: 'UI Design' },
        { value: 'ux', label: 'UX Design' },
        { value: 'brand', label: 'Branding' },
        { value: 'motion', label: 'Motion Design' },
        { value: 'graphic', label: 'Design Gráfico' },
        { value: 'product', label: 'Product Design' },
        { value: 'illustration', label: 'Ilustração' },
        { value: 'web', label: 'Web Design' },
        { value: '3d', label: 'Modelagem 3D' }
      ]
    },
    {
      value: 'coaching',
      label: 'Coaching e Mentoria',
      subtopics: [
        { value: 'business', label: 'Business Coach' },
        { value: 'career', label: 'Carreira' },
        { value: 'life', label: 'Life Coach' },
        { value: 'financial', label: 'Coach Financeiro' },
        { value: 'health', label: 'Coach de Saúde' },
        { value: 'executive', label: 'Coach Executivo' },
        { value: 'leadership', label: 'Liderança' },
        { value: 'productivity', label: 'Produtividade' },
        { value: 'mindfulness', label: 'Mindfulness' }
      ]
    },
    {
      value: 'tech',
      label: 'Tecnologia',
      subtopics: [
        { value: 'dev', label: 'Desenvolvimento' },
        { value: 'data', label: 'Data Science' },
        { value: 'ai', label: 'Inteligência Artificial' },
        { value: 'cloud', label: 'Cloud Computing' },
        { value: 'cyber', label: 'Cybersegurança' },
        { value: 'mobile', label: 'Desenvolvimento Mobile' },
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
        { value: 'devops', label: 'DevOps' },
        { value: 'blockchain', label: 'Blockchain' }
      ]
    },
    {
      value: 'finance',
      label: 'Finanças',
      subtopics: [
        { value: 'invest', label: 'Investimentos' },
        { value: 'crypto', label: 'Criptomoedas' },
        { value: 'trading', label: 'Trading' },
        { value: 'personal', label: 'Finanças Pessoais' },
        { value: 'business_fin', label: 'Finanças Empresariais' },
        { value: 'stocks', label: 'Ações' },
        { value: 'realestate', label: 'Investimentos Imobiliários' },
        { value: 'planning', label: 'Planejamento Financeiro' },
        { value: 'tax', label: 'Tributação' }
      ]
    },
    {
      value: 'education',
      label: 'Educação',
      subtopics: [
        { value: 'languages', label: 'Idiomas' },
        { value: 'elearning', label: 'Educação Online' },
        { value: 'k12', label: 'Ensino Fundamental e Médio' },
        { value: 'higher', label: 'Ensino Superior' },
        { value: 'professional', label: 'Educação Profissional' },
        { value: 'softskills', label: 'Habilidades Comportamentais' },
        { value: 'methodology', label: 'Metodologias de Ensino' }
      ]
    },
    {
      value: 'health',
      label: 'Saúde e Bem-estar',
      subtopics: [
        { value: 'nutrition', label: 'Nutrição' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'mental', label: 'Saúde Mental' },
        { value: 'medicine', label: 'Medicina' },
        { value: 'yoga', label: 'Yoga' },
        { value: 'functional', label: 'Treinamento Funcional' },
        { value: 'naturaltherapy', label: 'Terapias Naturais' },
        { value: 'sleep', label: 'Qualidade do Sono' }
      ]
    },
    {
      value: 'business',
      label: 'Negócios e Empreendedorismo',
      subtopics: [
        { value: 'startup', label: 'Startups' },
        { value: 'strategy', label: 'Estratégia' },
        { value: 'innovation', label: 'Inovação' },
        { value: 'management', label: 'Gestão' },
        { value: 'franchise', label: 'Franquias' },
        { value: 'sales', label: 'Vendas B2B' },
        { value: 'digitalentrepreneur', label: 'Empreendedorismo Digital' },
        { value: 'consulting', label: 'Consultoria' }
      ]
    },
    {
      value: 'creative',
      label: 'Artes e Criação',
      subtopics: [
        { value: 'photography', label: 'Fotografia' },
        { value: 'videomaking', label: 'Produção de Vídeo' },
        { value: 'music', label: 'Música' },
        { value: 'writing', label: 'Escrita Criativa' },
        { value: 'fashion', label: 'Moda' },
        { value: 'craft', label: 'Artesanato' },
        { value: 'digitalart', label: 'Arte Digital' }
      ]
    },
    {
      value: 'legal',
      label: 'Jurídico',
      subtopics: [
        { value: 'corporate', label: 'Direito Empresarial' },
        { value: 'tax', label: 'Direito Tributário' },
        { value: 'labor', label: 'Direito Trabalhista' },
        { value: 'consumer', label: 'Direito do Consumidor' },
        { value: 'digital', label: 'Direito Digital' },
        { value: 'property', label: 'Direito Imobiliário' }
      ]
    }
  ];

  // Mapeamento de emojis por nicho e subtópico
  const nicheEmojis: Record<string, Record<string, string[]>> = {
    marketing: {
      default: ['📈', '🚀', '💡', '📊', '🎯', '📱', '💻', '🔍'],
      traffic: ['💰', '📊', '🎯', '📱', '📈', '🔍'],
      social: ['📱', '📸', '🎥', '📊', '📈', '🚀'],
      content: ['📝', '📖', '🎬', '📊', '💡', '📚'],
      seo: ['🔍', '📊', '🌐', '📈', '⚡', '🏆'],
      email: ['📧', '📊', '🎯', '⚡', '📈', '💌'],
      growth: ['🚀', '📈', '⚡', '🔄', '💼', '🧪'],
      ecommerce: ['🛒', '💻', '🏪', '📊', '💳', '📦'],
      inbound: ['🧲', '📝', '📊', '🎯', '🔄', '📧'],
      analytics: ['📊', '📈', '🔍', '💻', '📉', '📋']
    },
    design: {
      default: ['🎨', '✨', '💡', '🖌️', '📐', '📱', '💻', '🖼️'],
      ui: ['📱', '💻', '🎨', '✨', '⚙️', '📐'],
      ux: ['👥', '📊', '💡', '🧩', '📱', '🔍'],
      brand: ['✨', '🎨', '🌈', '💼', '🚀', '💡'],
      motion: ['🎬', '✨', '🎨', '⚡', '🎥', '🎞️'],
      graphic: ['🎨', '🖌️', '📐', '✨', '🎭', '🖼️'],
      product: ['📱', '💻', '🎨', '🧩', '🔍', '📐'],
      illustration: ['🖌️', '🎨', '✏️', '🖼️', '✨', '📝'],
      web: ['🌐', '💻', '🎨', '📱', '⚙️', '✨'],
      '3d': ['🧊', '🎮', '🎨', '💻', '🏗️', '✨']
    },
    coaching: {
      default: ['🧠', '💪', '🚀', '✨', '💡', '🎯', '📈', '🔄'],
      business: ['💼', '📈', '🚀', '💡', '🎯', '⚡'],
      career: ['💼', '🚀', '🧗', '📊', '💪', '🎓'],
      life: ['✨', '🧠', '💪', '⚡', '🌱', '🧘'],
      financial: ['💰', '📊', '📈', '💹', '💸', '🏦'],
      health: ['💪', '🥗', '🧘', '⚡', '🌱', '❤️'],
      executive: ['💼', '📈', '👔', '🚀', '🏆', '📊'],
      leadership: ['👥', '🚀', '💼', '🌟', '🎯', '💪'],
      productivity: ['⏱️', '📋', '✅', '⚡', '🚀', '📈'],
      mindfulness: ['🧘', '🧠', '✨', '🌱', '🌿', '⚡']
    },
    tech: {
      default: ['💻', '⚙️', '🔧', '🚀', '📱', '🌐', '⚡', '🔍'],
      dev: ['💻', '⚙️', '🔧', '⚡', '🌐', '📱'],
      data: ['📊', '📈', '🔍', '💾', '🧮', '🔬'],
      ai: ['🤖', '🧠', '⚙️', '📊', '💡', '🔍'],
      cloud: ['☁️', '💻', '⚙️', '📡', '🌐', '🔐'],
      cyber: ['🔒', '🛡️', '⚙️', '🔍', '🔐', '⚠️'],
      mobile: ['📱', '💻', '⚙️', '🔧', '🌐', '📲'],
      frontend: ['💻', '🎨', '📱', '⚙️', '🌐', '✨'],
      backend: ['⚙️', '💻', '🔧', '🌐', '🔐', '💾'],
      devops: ['⚙️', '🔄', '🔧', '🚀', '💻', '☁️'],
      blockchain: ['🔗', '🔒', '💻', '📈', '⚙️', '🌐']
    },
    finance: {
      default: ['💰', '📊', '📈', '💹', '💸', '🏦', '💼', '🔐'],
      invest: ['📈', '💹', '💰', '📊', '🏦', '💼'],
      crypto: ['🪙', '📊', '📈', '💻', '🔒', '🌐'],
      trading: ['📊', '📈', '💹', '⚡', '💰', '🎯'],
      personal: ['💰', '📊', '💸', '💼', '🏦', '📝'],
      business_fin: ['💼', '📊', '💰', '📈', '🏦', '📝'],
      stocks: ['📈', '💹', '💰', '📊', '💼', '🏢'],
      realestate: ['🏠', '🏢', '💰', '📈', '🔑', '📊'],
      planning: ['📆', '💰', '📊', '📈', '🎯', '💼'],
      tax: ['📝', '💰', '📊', '💼', '📋', '🏦']
    },
    education: {
      default: ['📚', '🎓', '✏️', '📝', '💡', '🧠', '🔍', '📖'],
      languages: ['🗣️', '🌎', '📚', '🎓', '✏️', '📝'],
      elearning: ['💻', '📚', '🎓', '🔍', '📱', '📝'],
      k12: ['📚', '✏️', '🎒', '🧩', '🎨', '📝'],
      higher: ['🎓', '📚', '🔬', '💡', '📝', '👨‍🏫'],
      professional: ['💼', '📚', '🎓', '💡', '⚙️', '🔧'],
      softskills: ['🤝', '🗣️', '👥', '💡', '🚀', '🧠'],
      methodology: ['📚', '📝', '🧩', '🔍', '📊', '💡']
    },
    health: {
      default: ['💪', '🥗', '🧠', '❤️', '🌱', '🧘', '💧', '🏃'],
      nutrition: ['🥗', '🍎', '🥦', '💪', '📊', '🧪'],
      fitness: ['💪', '🏋️', '🏃', '⚡', '❤️', '🧘'],
      mental: ['🧠', '✨', '🧘', '💡', '💪', '🌱'],
      medicine: ['⚕️', '💊', '🔬', '❤️', '🧬', '🏥'],
      yoga: ['🧘', '✨', '💪', '🌱', '❤️', '🧠'],
      functional: ['💪', '🏋️', '⚡', '🔄', '🏃', '🧠'],
      naturaltherapy: ['🌿', '🌱', '✨', '🧘', '💆', '🔮'],
      sleep: ['😴', '🌙', '💤', '🛌', '⏰', '🧠']
    },
    business: {
      default: ['💼', '📈', '🚀', '💡', '🔍', '🎯', '⚙️', '📊'],
      startup: ['🚀', '💼', '💡', '📈', '🔍', '⚙️'],
      strategy: ['🎯', '📊', '💼', '🚀', '🧩', '📈'],
      innovation: ['💡', '🚀', '⚙️', '🧪', '🔍', '💼'],
      management: ['👥', '⚙️', '📊', '📋', '💼', '📈'],
      franchise: ['🏪', '🔗', '💼', '📊', '🚀', '🔄'],
      sales: ['💰', '🤝', '📈', '💼', '🎯', '📊'],
      digitalentrepreneur: ['💻', '🚀', '💼', '📱', '💡', '📊'],
      consulting: ['💼', '🔍', '💡', '📊', '🤝', '📈']
    },
    creative: {
      default: ['🎨', '✨', '📸', '🎬', '🖌️', '🎵', '📝', '✏️'],
      photography: ['📸', '🎨', '✨', '👁️', '🖼️', '🌟'],
      videomaking: ['🎬', '🎥', '🎞️', '✨', '🎨', '🎭'],
      music: ['🎵', '🎶', '🎸', '🎹', '🎧', '🎤'],
      writing: ['✍️', '📝', '📚', '💭', '✨', '📖'],
      fashion: ['👗', '👠', '🧵', '✨', '🎨', '👔'],
      craft: ['🧶', '✂️', '🖌️', '🎨', '✨', '🧵'],
      digitalart: ['🖌️', '💻', '🎨', '✨', '🖼️', '📱']
    },
    legal: {
      default: ['⚖️', '📜', '📋', '🔍', '💼', '📝', '📚', '🏛️'],
      corporate: ['⚖️', '💼', '📜', '🏢', '📋', '📝'],
      tax: ['⚖️', '💰', '📋', '📝', '📊', '🏛️'],
      labor: ['⚖️', '👥', '📜', '📋', '🤝', '📝'],
      consumer: ['⚖️', '🛒', '🔍', '📜', '🏛️', '📋'],
      digital: ['⚖️', '💻', '🌐', '📱', '🔒', '📜'],
      property: ['⚖️', '🏠', '🔑', '📜', '📋', '📝']
    }
  };

  const generateRandomProfile = () => {
    // Estruturas de perfil para cada nicho
    const nicheStructures = {
      marketing: [
        {
          username: "marketing.pro",
          displayName: "Alex Marketing",
          category: "Especialista em Marketing",
          bio: "📈 Especialista em Marketing Digital\n💡 Estratégias de Crescimento\n📊 Marketing de Performance\n🎯 Ajudando empresas a escalar",
          location: "São Paulo, SP",
          link: "alexmarketing.com.br",
          posts: 184,
          followers: 2134,
          following: 513,
        },
        {
          username: "digital.mkt",
          displayName: "Marcela Digital",
          category: "Estrategista de Marketing",
          bio: "🚀 Marketing estratégico para resultados\n💻 Especialista em campanhas digitais\n📱 Conectando marcas ao público certo\n📩 Agende uma consultoria gratuita",
          location: "Belo Horizonte, MG",
          link: "marceladigital.com.br",
          posts: 156,
          followers: 4578,
          following: 643,
        }
      ],
      design: [
        {
          username: "design.creative",
          displayName: "Paula Design",
          category: "Designer de UI/UX",
          bio: "🎨 Designer UI/UX\n✨ Criação de Marca\n💡 Dicas de Design\n🎯 Ajudando marcas a se destacarem",
          location: "Rio de Janeiro, RJ",
          link: "pauladesign.com.br",
          posts: 156,
          followers: 3247,
          following: 892,
        },
        {
          username: "creative.studio",
          displayName: "Rafael Criativo",
          category: "Designer Visual",
          bio: "✨ Transformando ideias em designs incríveis\n🖌️ Especialista em identidade visual\n🎨 Criando experiências memoráveis\n🔍 Vamos conversar sobre seu projeto?",
          location: "Curitiba, PR",
          link: "rafaelcriativo.com.br",
          posts: 217,
          followers: 4123,
          following: 795,
        }
      ],
      coaching: [
        {
          username: "coaching.pro",
          displayName: "Carla Coaching",
          category: "Coach Profissional",
          bio: "🧠 Coach certificada internacional\n💪 Desenvolvimento pessoal e profissional\n✨ Metodologia exclusiva de resultados\n🚀 Agende sua sessão diagnóstico",
          location: "Florianópolis, SC",
          link: "carlacoaching.com.br",
          posts: 132,
          followers: 5623,
          following: 421,
        },
        {
          username: "mentor.sucesso",
          displayName: "Ricardo Mentor",
          category: "Mentor de Alta Performance",
          bio: "🚀 Mentoria de alto impacto\n⚡ Transformando potencial em resultados\n💡 Método comprovado por mais de 500 clientes\n🎯 Descubra como transformar sua vida",
          location: "Brasília, DF",
          link: "ricardomentor.com.br",
          posts: 95,
          followers: 8745,
          following: 312,
        }
      ],
      tech: [
        {
          username: "tech.solutions",
          displayName: "Felipe Tech",
          category: "Desenvolvedor Full-Stack",
          bio: "💻 Desenvolvedor Web & Mobile\n⚙️ Soluções tecnológicas inovadoras\n🚀 Transformando ideias em código\n🔗 Conheça meu portfólio de projetos",
          location: "São Paulo, SP",
          link: "felipetech.dev",
          posts: 87,
          followers: 2543,
          following: 345,
        },
        {
          username: "dev.master",
          displayName: "Ana Desenvolvedora",
          category: "Especialista em Tecnologia",
          bio: "🤖 Desenvolvimento e inteligência artificial\n📱 Apps que transformam negócios\n💡 Soluções tecnológicas sob medida\n💬 Vamos criar algo incrível juntos?",
          location: "Porto Alegre, RS",
          link: "anadev.tech",
          posts: 124,
          followers: 3621,
          following: 472,
        }
      ],
      finance: [
        {
          username: "financa.inteligente",
          displayName: "Pedro Investimentos",
          category: "Consultor Financeiro",
          bio: "💰 Especialista em investimentos\n📊 Estratégias financeiras personalizadas\n📈 Resultados comprovados no mercado\n🔐 Agende sua consultoria financeira",
          location: "São Paulo, SP",
          link: "pedroinvest.com.br",
          posts: 142,
          followers: 6732,
          following: 289,
        },
        {
          username: "invest.pro",
          displayName: "Juliana Finanças",
          category: "Educadora Financeira",
          bio: "📈 Transformando sua relação com dinheiro\n💼 Planejamento financeiro inteligente\n💡 Educação financeira acessível\n🏦 Liberdade financeira começa aqui",
          location: "Rio de Janeiro, RJ",
          link: "julianafinancas.com.br",
          posts: 176,
          followers: 5431,
          following: 392,
        }
      ],
      education: [
        {
          username: "edu.transformadora",
          displayName: "Marcos Educador",
          category: "Professor & Mentor",
          bio: "📚 Educador apaixonado por transformar vidas\n🎓 Metodologia inovadora de ensino\n💡 Tornando o aprendizado acessível\n📝 Agende uma aula experimental",
          location: "Salvador, BA",
          link: "marcoseducador.com.br",
          posts: 167,
          followers: 4521,
          following: 532,
        },
        {
          username: "ensino.criativo",
          displayName: "Patrícia Educação",
          category: "Especialista em Educação",
          bio: "🎓 Transformando educação e aprendizado\n📚 Métodos inovadores e práticos\n💡 Especialista em educação personalizada\n✨ Descubra seu potencial de aprendizado",
          location: "Recife, PE",
          link: "patriciaedu.com.br",
          posts: 203,
          followers: 3876,
          following: 425,
        }
      ],
      health: [
        {
          username: "saude.integral",
          displayName: "Mariana Saúde",
          category: "Nutricionista Funcional",
          bio: "🥗 Nutrição funcional e integrativa\n💪 Transformando vidas através da alimentação\n❤️ Saúde de dentro para fora\n✨ Agende sua consulta personalizada",
          location: "Curitiba, PR",
          link: "marianasaude.com.br",
          posts: 198,
          followers: 7654,
          following: 426,
        },
        {
          username: "bem.estar",
          displayName: "Lucas Wellness",
          category: "Personal Trainer",
          bio: "💪 Especialista em treinamento personalizado\n🏃 Transformação física e mental\n🌱 Saúde integrada e qualidade de vida\n⚡ Comece sua jornada de transformação",
          location: "Florianópolis, SC",
          link: "lucaswellness.com.br",
          posts: 234,
          followers: 9876,
          following: 378,
        }
      ],
      business: [
        {
          username: "negocio.estrategico",
          displayName: "Roberto Negócios",
          category: "Consultor Empresarial",
          bio: "💼 Estratégias de crescimento empresarial\n📈 Transformando empresas com resultados\n🚀 Soluções para desafios complexos\n🎯 Agende uma consultoria estratégica",
          location: "São Paulo, SP",
          link: "robertonegocios.com.br",
          posts: 142,
          followers: 5432,
          following: 387,
        },
        {
          username: "empreende.sucesso",
          displayName: "Amanda Empreendedora",
          category: "Mentora de Negócios",
          bio: "🚀 Empreendedorismo de impacto\n💡 Estratégias de crescimento acelerado\n💼 Mentoria para resultados reais\n📊 Transforme seu negócio comigo",
          location: "Belo Horizonte, MG",
          link: "amandaempreende.com.br",
          posts: 187,
          followers: 6543,
          following: 412,
        }
      ],
      creative: [
        {
          username: "arte.visual",
          displayName: "Camila Criativa",
          category: "Fotógrafa & Diretora",
          bio: "📸 Fotografia que conta histórias\n🎬 Produção visual criativa\n✨ Capturando momentos únicos\n🖼️ Vamos criar memórias juntos?",
          location: "Rio de Janeiro, RJ",
          link: "camilacriativa.com.br",
          posts: 312,
          followers: 8754,
          following: 523,
        },
        {
          username: "criador.conteudo",
          displayName: "Bruno Arte",
          category: "Artista Digital",
          bio: "🎨 Arte digital e ilustração\n✏️ Criações exclusivas para marcas\n🖌️ Transformando ideias em arte\n💌 Entre em contato para orçamentos",
          location: "Porto Alegre, RS",
          link: "brunoarte.com.br",
          posts: 289,
          followers: 7632,
          following: 456,
        }
      ],
      legal: [
        {
          username: "juridico.especialista",
          displayName: "Dra. Renata Direito",
          category: "Advogada Especialista",
          bio: "⚖️ Advocacia especializada e consultiva\n📜 Soluções jurídicas personalizadas\n🔍 Atendimento humanizado e efetivo\n📋 Agende uma consulta inicial",
          location: "São Paulo, SP",
          link: "renatadireito.adv.br",
          posts: 87,
          followers: 3456,
          following: 298,
        },
        {
          username: "advogado.digital",
          displayName: "Dr. Carlos Jurídico",
          category: "Advogado Empresarial",
          bio: "⚖️ Direito empresarial e digital\n💼 Protegendo negócios e empreendedores\n📝 Consultoria jurídica estratégica\n🏛️ Agende uma análise de caso",
          location: "Brasília, DF",
          link: "carlosjuridico.com.br",
          posts: 104,
          followers: 4321,
          following: 267,
        }
      ]
    };

    // Se nenhum nicho foi selecionado, retorna
    if (!selectedNiche) return;

    // Obter estruturas do nicho selecionado
    const structures = nicheStructures[selectedNiche as keyof typeof nicheStructures] || [];

    if (structures.length > 0) {
      // Seleciona uma estrutura aleatória
      const randomStructure = structures[Math.floor(Math.random() * structures.length)];
      
      // Copia a estrutura base
      const updatedProfile = { ...randomStructure };
      
      // Se um subtópico estiver selecionado, personaliza para esse subtópico
      if (selectedSubtopic) {
        const subtopicLabel = niches.find(n => n.value === selectedNiche)?.subtopics.find(s => s.value === selectedSubtopic)?.label || '';
        
        if (subtopicLabel) {
          // Atualiza a categoria para incluir a especialidade
          updatedProfile.category = `Especialista em ${subtopicLabel}`;
          
          // Adiciona a especialidade na bio (substitui a terceira linha se existir)
          const bioLines = updatedProfile.bio.split('\n');
          if (bioLines.length >= 3) {
            // Seleciona um emoji do conjunto específico do subtópico
            const emojiSet = nicheEmojis[selectedNiche]?.[selectedSubtopic] || nicheEmojis[selectedNiche]?.default || ['💡'];
            const selectedEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
            
            // Substitui a linha 3 com a especialidade
            bioLines[2] = `${selectedEmoji} Especialista em ${subtopicLabel}`;
            updatedProfile.bio = bioLines.join('\n');
          }
        }
      }
      
      // Atualiza o estado do perfil
      setProfile(prev => ({ ...prev, ...updatedProfile }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImage(imageUrl);
        setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBioWithAI = async () => {
    if (!selectedNiche) {
      setBioError('Selecione um nicho para gerar uma bio personalizada');
      return;
    }

    setIsGeneratingBio(true);
    setBioError(null);

    try {
      const selectedNicheLabel = niches.find(n => n.value === selectedNiche)?.label || '';
      const selectedSubtopicLabel = selectedSubtopic 
        ? niches.find(n => n.value === selectedNiche)?.subtopics.find(s => s.value === selectedSubtopic)?.label || ''
        : '';

      // Incluindo as preferências do usuário no prompt
      const bioPreference = profile.bioPreference 
        ? `\n\nConsidere as seguintes preferências do usuário: ${profile.bioPreference}` 
        : '';

      // Construindo o prompt de forma mais estruturada
      const especialidade = selectedSubtopicLabel ? ` especializado em ${selectedSubtopicLabel}` : '';
      
      let platformSpecificPrompt = '';
      if (selectedPlatform === 'instagram') {
        platformSpecificPrompt = `Gere uma biografia profissional para Instagram em português brasileiro para um profissional de "${selectedNicheLabel}${especialidade}". A bio deve ter 4 linhas, usar emojis relevantes no início de cada linha, destacar expertise e benefícios para o público, e terminar com um call-to-action sutil.`;
      } else {
        platformSpecificPrompt = `Gere uma biografia profissional para TikTok em português brasileiro para um profissional de "${selectedNicheLabel}${especialidade}". A bio deve ser curta (máximo 80 caracteres), impactante, usar no máximo 2 emojis estratégicos, focar em chamar atenção rapidamente e incentivar o público a assistir os vídeos. Deve refletir o estilo dinâmico do TikTok.`;
      }
      
      const prompt = `${platformSpecificPrompt}${bioPreference}`;

      console.log('Enviando requisição para API Deepseek:', prompt);
      
      // Tentativa com timeout para não bloquear a interface
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - A API demorou muito para responder')), 15000);
      });
      
      // Chamada real da API
      const fetchPromise = fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-5aa1c8205bb846b68c3de8660b3523e4'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente especializado em criar biografias profissionais para ${selectedPlatform === 'instagram' ? 'Instagram' : 'TikTok'}. Forneça apenas a biografia, sem explicações adicionais.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        }),
      });
      
      // Executa com timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      // Verificar e registrar detalhes da resposta para debug
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API do Deepseek - Status:', response.status, 'Resposta:', errorText);
        
        // Mensagem de erro específica para problemas comuns
        if (response.status === 401) {
          throw new Error('Erro de autenticação: Verifique a chave da API Deepseek');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
        } else {
          throw new Error(`Erro na API (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const result = await response.json();
      console.log('Resposta da API Deepseek:', result);
      
      // Extrair a bio gerada da resposta da API
      let generatedBio = '';
      if (result.choices && result.choices[0]?.message?.content) {
        generatedBio = result.choices[0].message.content.trim();
      } else {
        console.error('Formato de resposta inesperado:', result);
        throw new Error('Formato de resposta inválido da API');
      }

      // Processar a bio para garantir que esteja formatada corretamente
      let formattedBio = generatedBio;
      
      // Verificar se a bio contém linhas separadas, caso contrário, dividir manualmente
      let bioLines = formattedBio.split('\n').filter((line: string) => line.trim() !== '');
      
      // Se a resposta veio como um parágrafo único, tentar dividir em linhas
      if (bioLines.length <= 1 && formattedBio.length > 50) {
        // Dividir por pontuação ou a cada ~40 caracteres
        const sentences = formattedBio.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          bioLines = sentences.slice(0, 4);
        } else {
          // Dividir o texto em chunks de aproximadamente 40 caracteres
          bioLines = [];
          let remainingText = formattedBio;
          while (remainingText.length > 0 && bioLines.length < 4) {
            const cutPoint = Math.min(40, remainingText.length);
            const lastSpace = remainingText.substring(0, cutPoint).lastIndexOf(' ');
            const splitPoint = lastSpace > 0 ? lastSpace : cutPoint;
            
            bioLines.push(remainingText.substring(0, splitPoint).trim());
            remainingText = remainingText.substring(splitPoint).trim();
          }
        }
      }
      
      // Limitar a no máximo 4 linhas
      bioLines = bioLines.slice(0, 4);
      
      // Adicionar emojis se não existirem
      bioLines = bioLines.map((line: string, index: number) => {
        // Verificar se a linha já começa com emoji
        if (!/^\p{Emoji}/u.test(line)) {
          // Selecionar conjunto de emojis apropriado para o nicho
          const emojiSet = nicheEmojis[selectedNiche]?.[selectedSubtopic || 'default'] || nicheEmojis[selectedNiche]?.default || ['✨', '🚀', '💡', '🎯'];
          const emoji = index < emojiSet.length ? emojiSet[index] : emojiSet[Math.floor(Math.random() * emojiSet.length)];
          return `${emoji} ${line}`;
        }
        return line;
      });
      
      // Juntar as linhas de volta em uma string
      formattedBio = bioLines.join('\n');
      
      // Adicionar preferência do usuário se existir e não estiver já incorporada
      if (profile.bioPreference && !formattedBio.toLowerCase().includes(profile.bioPreference.toLowerCase().substring(0, 15))) {
        const emojiSet = nicheEmojis[selectedNiche]?.default || ['✨', '💫', '🌟', '💯'];
        const preferenceEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
        
        // Adicionar como uma 5ª linha se tivermos espaço
        if (bioLines.length < 4) {
          formattedBio += `\n${preferenceEmoji} ${profile.bioPreference.substring(0, 30)}`;
        }
      }
      
      // Atualizar a bio no perfil
      setProfile(prev => ({ ...prev, bio: formattedBio }));
      
    } catch (error) {
      console.error('Erro completo ao gerar bio:', error);
      
      // Fallback para quando a API falha - geração local de bio
      const nicheBios: Record<string, Record<string, string[]>> = {
        instagram: {
          marketing: [
            "📈 Especialista em Marketing Digital\n🚀 Estratégias de crescimento que geram resultados\n💡 Ajudo empresas a alcançarem mais clientes\n🎯 Vamos conversar sobre seu próximo projeto?",
            "🚀 Transformando ideias em estratégias digitais\n📊 Especialista em performance e dados\n💻 Marketing que converte e escala seu negócio\n📱 Entre em contato para uma análise gratuita"
          ],
          design: [
            "🎨 Designer apaixonado por soluções criativas\n✨ Transformando marcas em experiências memoráveis\n📱 UI/UX que encanta e converte\n🖌️ Vamos dar vida ao seu projeto?",
            "✨ Criando designs que comunicam e convertem\n🖌️ Especialista em identidade visual e UI/UX\n🎨 Soluções criativas para sua marca se destacar\n🔍 Agende uma consulta de design"
          ],
          coaching: [
            "🧠 Coach certificado com método exclusivo\n💪 Especialista em transformação e resultados\n✨ Ajudo você a alcançar seu potencial máximo\n🚀 Agende uma sessão diagnóstico gratuita",
            "✨ Transformando potencial em resultados reais\n💡 Metodologia exclusiva e personalizada\n🎯 Focado em ajudar você a atingir suas metas\n💬 Vamos conversar sobre seu futuro?"
          ],
          tech: [
            "💻 Desenvolvendo soluções tecnológicas inovadoras\n⚙️ Especialista em otimização e performance\n🔧 Transformando problemas em oportunidades\n🚀 Vamos criar algo incrível juntos?",
            "🤖 Especialista em soluções de tecnologia\n⚡ Desenvolvimento ágil e eficiente\n🌐 Conectando pessoas através da tecnologia\n💬 Conte-me sobre seu projeto"
          ],
          finance: [
            "💰 Especialista em finanças e investimentos\n📊 Estratégias personalizadas para seu patrimônio\n💹 Resultados comprovados no mercado\n🔐 Agende uma consultoria financeira",
            "📈 Transformando sonhos em planos financeiros\n💼 Especialista em investimentos e planejamento\n💰 Estratégias personalizadas para seu perfil\n🏦 Vamos construir seu futuro financeiro?"
          ],
          education: [
            "📚 Educador apaixonado por transformar vidas\n🎓 Metodologia comprovada de aprendizado\n💡 Tornando o conhecimento acessível e prático\n📝 Agende uma aula experimental",
            "🎓 Especialista em educação personalizada\n📚 Desenvolvendo habilidades para o futuro\n🧠 Métodos inovadores que potencializam resultados\n✨ Transforme seu conhecimento comigo"
          ],
          health: [
            "💪 Especialista em saúde e bem-estar\n🥗 Transformando vidas através de hábitos saudáveis\n❤️ Programas personalizados para seus objetivos\n🌱 Agende uma consulta inicial gratuita",
            "🌱 Promovendo saúde integral e equilíbrio\n💪 Metodologia exclusiva baseada em ciência\n🧠 Transformando corpo e mente\n⚡ Vamos começar sua jornada de transformação?"
          ],
          business: [
            "💼 Especialista em estratégias de negócios\n📈 Transformando empresas com resultados comprovados\n🚀 Soluções inovadoras para desafios complexos\n🎯 Vamos conversar sobre seu negócio?",
            "🚀 Empreendedor com foco em resultados\n💡 Desenvolvendo negócios de alto impacto\n📊 Estratégias testadas e aprovadas pelo mercado\n💼 Agende uma consultoria estratégica"
          ],
          creative: [
            "🎨 Artista e criador de conteúdo original\n✨ Transformando ideias em arte visual impactante\n🖌️ Projetos criativos que conectam e emocionam\n📸 Vamos colaborar no seu próximo projeto?",
            "📸 Capturando momentos e criando histórias\n🎬 Especialista em narrativa visual\n✨ Arte que conecta marcas e pessoas\n🎨 Entre em contato para orçamentos"
          ],
          legal: [
            "⚖️ Advogado especializado em soluções jurídicas\n📜 Experiência comprovada em casos complexos\n🔍 Atendimento personalizado e resultados efetivos\n📋 Agende uma consulta inicial",
            "⚖️ Especialista em direito com abordagem estratégica\n📝 Soluções jurídicas para proteger seus interesses\n🏛️ Atuação ética e resultados consistentes\n💼 Vamos discutir seu caso?"
          ]
        },
        tiktok: {
          marketing: [
            "🚀 Dicas de marketing que vão viralizar seu negócio! Assista ↗️",
            "📲 Transformando seguidores em clientes! #MarketingDigital"
          ],
          design: [
            "🎨 Designs que fazem a diferença! Deslize para ver ↗️",
            "✨ Design que impressiona! Siga para inspiração diária."
          ],
          coaching: [
            "🧠 Transformação garantida! Veja meu método ↗️",
            "💡 Sua melhor versão está aqui! #Coaching"
          ],
          tech: [
            "💻 Tecnologia simplificada! Tutoriais exclusivos ↗️",
            "⚡ Soluções tech para o dia a dia. #TechTips"
          ],
          finance: [
            "💰 Dicas financeiras que ninguém te contou! Siga ↗️",
            "📈 Construindo riqueza um TikTok de cada vez!"
          ],
          education: [
            "📚 Aprendizado que transforma! Confira ↗️",
            "🎓 Educação para o futuro! Dicas diárias."
          ],
          health: [
            "💪 Treinos e dicas de saúde em 60s! Confira ↗️",
            "🥗 Saúde que cabe no seu dia. #SaúdeEmFoco"
          ],
          business: [
            "💼 Empreendendo com estratégia! Case de sucesso ↗️",
            "🚀 Negócios que impactam! Métodos exclusivos."
          ],
          creative: [
            "🎬 Arte em movimento! Novos vídeos toda semana ↗️",
            "📸 Criatividade que inspira! #ArteDigital"
          ],
          legal: [
            "⚖️ Direitos explicados em segundos! Siga para mais ↗️",
            "📝 Desmistificando o mundo jurídico! #DireitoSimples"
          ]
        }
      };

      // Determinar qual conjunto de bios usar com base na plataforma e nicho selecionados
      const bioSet = nicheBios[selectedPlatform]?.[selectedNiche] || nicheBios[selectedPlatform].marketing;
      
      // Selecionar uma bio aleatória do conjunto
      const randomBio = bioSet[Math.floor(Math.random() * bioSet.length)];
      
      // Ajustar a bio se um subtópico específico foi selecionado
      let finalBio = randomBio;
      if (selectedPlatform === 'instagram' && selectedSubtopic) {
        // Obter o label do subtópico
        const subtopicLabel = niches.find(n => n.value === selectedNiche)?.subtopics.find(s => s.value === selectedSubtopic)?.label || '';
        
        if (subtopicLabel) {
          // Adicionar menção ao subtópico na bio
          const bioLines = randomBio.split('\n');
          const specialtyLine = `💡 Especialista em ${subtopicLabel}`;
          
          // Substituir a terceira linha com a especialidade
          if (bioLines.length >= 3) {
            bioLines[2] = specialtyLine;
            finalBio = bioLines.join('\n');
          }
        }
      }

      // Considerar preferências do usuário se houver
      if (profile.bioPreference) {
        if (selectedPlatform === 'instagram') {
          // Incorporar algum elemento da preferência do usuário
          const bioLines = finalBio.split('\n');
          if (bioLines.length >= 4) {
            // Substituir a quarta linha para incluir algo da preferência
            const preferenceWords = profile.bioPreference.split(' ');
            const shortPreference = preferenceWords.slice(0, Math.min(5, preferenceWords.length)).join(' ');
            
            const emojiSet = nicheEmojis[selectedNiche]?.default || ['✨', '💫', '🌟'];
            const preferenceEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
            
            bioLines[3] = `${preferenceEmoji} ${shortPreference}... Vamos conversar?`;
            finalBio = bioLines.join('\n');
          }
        } else {
          // Para TikTok, incorporar uma preferência mais curta
          const preferenceWords = profile.bioPreference.split(' ');
          const shortPreference = preferenceWords.slice(0, Math.min(3, preferenceWords.length)).join(' ');
          finalBio = `✨ ${shortPreference}... ${finalBio.split('!')[0]}!`;
        }
      }
      
      // Usar bio gerada localmente e informar o usuário
      setProfile(prev => ({ ...prev, bio: finalBio }));
      setBioError('API indisponível. Bio gerada localmente usando perfis pré-definidos.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const addEmojisToProfile = () => {
    if (!selectedNiche) return;
    
    const subtopic = selectedSubtopic || 'default';
    const emojis = nicheEmojis[selectedNiche]?.[subtopic] || nicheEmojis[selectedNiche]?.default || ['✨', '🚀', '💡', '🎯'];
    
    // Seleciona 4 emojis aleatórios do conjunto disponível
    const selectedEmojis = [...emojis].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Divide a bio em linhas
    const bioLines = profile.bio.split('\n').filter((line: string) => line.trim() !== '');
    
    // Adiciona emojis para até 4 linhas
    const newBioLines = bioLines.map((line: string, index: number) => {
      // Remove emojis existentes no início da linha
      const cleanLine = line.replace(/^[\p{Emoji}\s]+/u, '').trim();
      return index < selectedEmojis.length ? `${selectedEmojis[index]} ${cleanLine}` : cleanLine;
    });
    
    // Se houver menos de 4 linhas, adiciona linhas vazias com emojis
    while (newBioLines.length < 4) {
      const index = newBioLines.length;
      if (index < selectedEmojis.length) {
        newBioLines.push(`${selectedEmojis[index]} `);
      }
    }
    
    // Adiciona uma linha com a preferência do usuário se existir
    if (profile.bioPreference && newBioLines.length >= 4) {
      // Acrescenta uma quinta linha com a preferência se for importante
      const preferenceWords = profile.bioPreference.split(' ');
      // Pega apenas as primeiras palavras para não ficar muito longo
      const shortPreference = preferenceWords.slice(0, Math.min(6, preferenceWords.length)).join(' ');
      
      // Adiciona um emoji relevante antes da preferência
      const relevantEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      newBioLines.push(`${relevantEmoji} ${shortPreference}...`);
    }
    
    setProfile(prev => ({ ...prev, bio: newBioLines.join('\n') }));
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(profile.bio);
    setBioCopied(true);
    setTimeout(() => {
      setBioCopied(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <motion.div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerador de Estrutura de Perfil
          </h1>
        </div>

        {/* Descrição */}
        <motion.div 
          className="bg-emerald-50/50 rounded-xl p-6 shadow-sm border border-emerald-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-emerald-600">
            Crie uma estrutura profissional para seu perfil do Instagram ou TikTok. 
            Personalize cada elemento e visualize em tempo real.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div className="space-y-6">
            {/* Seletor de Plataforma */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selecione a Plataforma
                </h3>
                
                {/* Botões de plataforma */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedPlatform === 'instagram'
                        ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-offset-2'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Instagram
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('tiktok')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedPlatform === 'tiktok'
                        ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" fill="currentColor"/>
                    </svg>
                    TikTok
                  </button>
                </div>
              </div>
            </div>

            {/* Seletor de Nicho Atualizado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selecione seu Nicho
                </h3>
                
                {/* Grid de Nichos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {niches.map((niche) => (
                    <button
                      key={niche.value}
                      onClick={() => {
                        setSelectedNiche(niche.value);
                        setSelectedSubtopic('');
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedNiche === niche.value
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {niche.label}
                    </button>
                  ))}
                </div>

                {/* Subtópicos */}
                {selectedNiche && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Especialidade em {niches.find(n => n.value === selectedNiche)?.label}
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                      {niches
                        .find(n => n.value === selectedNiche)
                        ?.subtopics.map((subtopic) => (
                          <button
                            key={subtopic.value}
                            onClick={() => setSelectedSubtopic(subtopic.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0 ${
                              selectedSubtopic === subtopic.value
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {subtopic.label}
                          </button>
                        ))}
                    </div>
                    {selectedSubtopic && (
                      <div className="bg-emerald-50 rounded-lg p-2 text-xs text-emerald-700">
                        <p className="font-medium">Selecionado: {niches.find(n => n.value === selectedNiche)?.subtopics.find(s => s.value === selectedSubtopic)?.label}</p>
                        <p className="text-emerald-600 mt-0.5">A bio será personalizada para esta especialidade</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Barra de Progresso */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${selectedNiche ? (selectedSubtopic ? '100%' : '50%') : '0%'}` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {!selectedNiche 
                      ? 'Selecione um nicho' 
                      : !selectedSubtopic 
                        ? 'Selecione uma especialidade' 
                        : 'Pronto para gerar!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão Gerar Estrutura */}
            <button
              onClick={generateRandomProfile}
              disabled={!selectedNiche}
              className={`w-full px-4 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
                selectedNiche
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transform hover:scale-[1.02]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Wand2 className="h-5 w-5" />
              <span>
                {selectedNiche
                  ? `Gerar Estrutura para ${
                      selectedSubtopic 
                        ? niches.find(n => n.value === selectedNiche)?.subtopics.find(s => s.value === selectedSubtopic)?.label
                        : niches.find(n => n.value === selectedNiche)?.label
                    }`
                  : 'Selecione um nicho para gerar'}
              </span>
            </button>

            {/* Formulário - ajuste os espaçamentos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Upload de Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto do Perfil
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-4 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                      <Camera className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Escolher Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Campos do Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={profile.category}
                      onChange={(e) => setProfile(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="Ex: Criador Digital"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">
                      Bio
                    </label>
                      <button
                        onClick={handleCopyBio}
                        className={`text-xs px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 transition-all duration-300 ${
                          bioCopied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {bioCopied ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copiar Bio</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-2">
                    <textarea
                      id="bio-textarea"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="Sua biografia"
                    />
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Preferências para bio (opcional)
                        </label>
                        <input
                          type="text"
                          value={profile.bioPreference || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, bioPreference: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-2 text-sm"
                          placeholder="Ex: Quero destacar minha experiência internacional e certificações"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Informe características específicas ou tópicos que gostaria de destacar na sua bio
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={generateBioWithAI}
                          disabled={isGeneratingBio || !selectedNiche}
                          className={`w-full px-4 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
                            isGeneratingBio || !selectedNiche
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transform hover:scale-[1.02]'
                          }`}
                        >
                          {isGeneratingBio ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Gerando bio...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              <span>Gerar com Deepseek V3</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {bioError && (
                        <p className="text-xs text-red-500">{bioError}</p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Use a IA avançada DeepSeek V3 para gerar uma bio profissional alinhada com seu nicho. A IA foi treinada com 15 trilhões de tokens e oferece resultados de alta qualidade.
                      </p>
                      
                      <p className="text-xs text-gray-500 text-center mt-1">
                        Esta ferramenta é apenas uma ajuda inicial. Para usos mais avançados da IA, 
                        visite o <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">site oficial da Deepseek</a>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="Cidade, Estado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link
                    </label>
                    <input
                      type="text"
                      value={profile.link}
                      onChange={(e) => setProfile(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                      placeholder="seusite.com.br"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview - Redesenhado para ficar mais clean */}
          <motion.div className="space-y-6">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preview do Perfil
                </h2>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Visualização em tempo real
                </div>
              </div>

              {/* Container do Preview */}
              {selectedPlatform === 'instagram' ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-[380px] mx-auto overflow-hidden">
                  {/* Header do Instagram */}
                  <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{profile.username}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Conteúdo do Perfil */}
                  <div className="p-4">
                    {/* Cabeçalho do Perfil */}
                    <div className="flex items-start mb-5">
                      {/* Foto do Perfil */}
                      <div className="w-[77px] h-[77px] rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                        {uploadedImage ? (
                          <img 
                            src={uploadedImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Estatísticas */}
                      <div className="flex-1 ml-6">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="font-semibold text-sm">{profile.posts}</div>
                            <div className="text-xs text-gray-500">publicações</div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{profile.followers}</div>
                            <div className="text-xs text-gray-500">seguidores</div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{profile.following}</div>
                            <div className="text-xs text-gray-500">seguindo</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Perfil */}
                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold text-sm">{profile.displayName}</div>
                        <div className="text-xs text-gray-500">{profile.category}</div>
                      </div>
                      
                      <div className="text-xs whitespace-pre-line leading-relaxed">
                        {profile.bio}
                      </div>

                      {profile.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {profile.location}
                        </div>
                      )}

                      {profile.link && (
                        <a 
                          href={`https://${profile.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-xs text-blue-900 font-medium"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {profile.link}
                        </a>
                      )}
                    </div>

                    {/* Botões do Perfil */}
                    <div className="mt-3 grid grid-cols-7 gap-1">
                      <button className="col-span-6 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium">
                        Editar perfil
                      </button>
                      <button className="col-span-1 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Tabs do Instagram */}
                  <div className="grid grid-cols-3 border-t border-gray-200">
                    <div className="py-2 flex justify-center border-t-2 border-black">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    </div>
                    <div className="py-2 flex justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="py-2 flex justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-[380px] mx-auto overflow-hidden">
                  {/* Cabeçalho do TikTok */}
                  <div className="bg-white text-black px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" fill="currentColor"/>
                      </svg>
                      <span className="font-semibold text-sm">TikTok</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                  </div>

                  {/* Conteúdo do Perfil TikTok */}
                  <div className="p-4 bg-white text-black">
                    {/* Foto do Perfil e Informações */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-[120px] h-[120px] rounded-full border border-gray-200 overflow-hidden mb-2">
                        {uploadedImage ? (
                          <img 
                            src={uploadedImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">@{profile.username}</div>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex justify-center space-x-16 mb-6 text-center">
                      <div>
                        <div className="font-bold">{profile.following}</div>
                        <div className="text-xs text-gray-500">Seguindo</div>
                      </div>
                      <div>
                        <div className="font-bold">{profile.followers}</div>
                        <div className="text-xs text-gray-500">Seguidores</div>
                      </div>
                      <div>
                        <div className="font-bold">{profile.posts * 1000}</div>
                        <div className="text-xs text-gray-500">Curtidas</div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <button className="col-span-2 px-3 py-2 bg-black text-white rounded-md text-sm font-medium">
                        Editar perfil
                      </button>
                      <button className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm font-medium flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                          <polyline points="16 6 12 2 8 6"></polyline>
                          <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                      </button>
                      <button className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm font-medium flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>
                    </div>

                    {/* Bio e Informações */}
                    <div className="mb-4">
                      <div className="text-sm text-center">{profile.displayName}</div>
                      <div className="whitespace-pre-line text-sm my-2 text-center">
                        {profile.bio}
                      </div>
                      
                      {/* Link */}
                      {profile.link && (
                        <div className="flex items-center justify-center py-1 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                          <a 
                            href={`https://${profile.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-gray-700"
                          >
                            {profile.link}
                          </a>
                        </div>
                      )}
                      
                      {/* TikTok Studio */}
                      <div className="flex items-center justify-center py-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff0050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        <span className="text-sm font-medium">TikTok Studio</span>
                      </div>
                    </div>

                    {/* Abas inferiores */}
                    <div className="border-t border-gray-200 mt-4 pt-2 flex justify-between">
                      <div className="flex-1 flex justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" y1="9" x2="20" y2="9"></line>
                          <line x1="4" y1="15" x2="20" y2="15"></line>
                          <line x1="10" y1="3" x2="8" y2="21"></line>
                          <line x1="16" y1="3" x2="14" y2="21"></line>
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Botões de Ação - Redesenhados */}
      <div className="mt-6 space-y-3">
        {/* Dicas */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-emerald-800 text-sm">Dica 1: Emojis Estratégicos</h3>
                <p className="text-xs text-emerald-600 mt-1">
                  Use emojis estrategicamente para destacar pontos importantes e tornar seu perfil mais atrativo visualmente.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-emerald-800 text-sm">Dica 2: Consistência no Conteúdo</h3>
                <p className="text-xs text-emerald-600 mt-1">
                  Mantenha uma linha editorial consistente. Escolha uma paleta de cores e estilo que represente sua marca pessoal.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-emerald-800 text-sm">Dica 3: Storytelling Autêntico</h3>
                <p className="text-xs text-emerald-600 mt-1">
                  Conte sua história de forma autêntica. Compartilhe jornada, desafios e conquistas para criar conexão genuína com seu público.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileStructureGenerator; 