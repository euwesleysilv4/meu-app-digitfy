import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitFork, LineChart, Share2, Gift, CreditCard, ShoppingCart, 
  Mail, FileText, PlusCircle, ChevronRight, Grid3X3, 
  MessageSquare, Youtube, Smartphone, Instagram, Lightbulb, Star,
  Edit, Trash2, AlertCircle, Linkedin, Video, Check, DollarSign, Zap,
  MessageCircle, Clock, Facebook, Plus, Edit3, Twitter, Image, Link, PhoneCall, Phone, Globe, Send, Camera, User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { funnelService, SavedFunnelTemplate } from '../services/funnelService';
import FunnelShareModal from '../components/FunnelShareModal';
import ImportFunnelModal from '../components/ImportFunnelModal';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.5,
      ease: "easeIn"
    }
  }
};

const funnelTypes = [
  { id: 'sales', name: 'Vendas', icon: <ShoppingCart size={20} /> },
  { id: 'leads', name: 'Captura de Leads', icon: <FileText size={20} /> },
  { id: 'webinar', name: 'Webinar', icon: <Share2 size={20} /> },
  { id: 'launch', name: 'Lançamento', icon: <Gift size={20} /> },
  { id: 'membership', name: 'Membership', icon: <CreditCard size={20} /> },
  { id: 'saas', name: 'SaaS', icon: <Grid3X3 size={20} /> },
  { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingCart size={20} /> },
  { id: 'survey', name: 'Pesquisa/Quiz', icon: <MessageSquare size={20} /> }
];

// Array vazio de templates de funil
const funnelTemplates: {
  id: number;
  type: string;
  title: string;
  description: string;
  steps: string[];
  icon: React.ReactNode;
}[] = [];

const FunnelFy = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [userTemplates, setUserTemplates] = useState<SavedFunnelTemplate[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<{id: string, title: string} | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Função para fechar o modal beta
  const closeBetaModal = () => {
    setShowBetaModal(false);
    // Opcionalmente, salvar no localStorage para não mostrar novamente na sessão
    localStorage.setItem('funnelBuilderBetaModalShown', 'true');
  };

  // Verificar se o modal já foi exibido nesta sessão
  useEffect(() => {
    const betaModalShown = localStorage.getItem('funnelBuilderBetaModalShown');
    if (betaModalShown === 'true') {
      setShowBetaModal(false);
    }
  }, []);

  // Buscar modelos do usuário usando o funnelService
  useEffect(() => {
    const loadUserTemplates = async () => {
      console.log("=========== CARREGANDO MODELOS DE FUNIL NA PÁGINA DE LISTAGEM ===========");
      setIsLoading(true);
      
      try {
        // Força a verificação de autenticação antes de carregar os funis
        console.log("Verificando autenticação e carregando funis...");
        
        // Desativar a busca no localStorage para garantir uso exclusivo do Supabase
        localStorage.removeItem('userFunnelTemplates');
        
        const templates = await funnelService.getAllFunnels();
        console.log("Modelos encontrados:", templates.length);
        
        // Log detalhado de cada modelo
        templates.forEach((template: SavedFunnelTemplate, index: number) => {
          console.log(`Modelo ${index + 1}: ${template.title}`);
          console.log(`  ID: ${template.id}`);
          console.log(`  Tipo: ${template.type}`);
          console.log(`  Ícone: ${template.icon}`);
          console.log(`  Elementos: ${template.steps.length}`);
          
          // Log da lista de elementos
          template.steps.forEach((step: any, stepIndex: number) => {
            console.log(`    Elemento ${stepIndex + 1}: ${step.name} (${step.id}), tipo: ${step.type}, iconType: ${step.iconType || 'não definido'}`);
          });
        });
        
        setUserTemplates(templates);
      } catch (error) {
        console.error("Erro ao carregar modelos de funil:", error);
      } finally {
        setIsLoading(false);
      }
      
      console.log("=========== FIM DO CARREGAMENTO DE MODELOS ===========");
    };
    
    loadUserTemplates();
  }, []);

  const handleSelectTemplate = (id: number) => {
    setSelectedTemplate(id === selectedTemplate ? null : id);
  };

  const handleCreateCustomFunnel = () => {
    // Verifica se estamos no dashboard pela URL atual
    const isInDashboard = location.pathname.includes('/dashboard');
    
    // Limpar qualquer modelo em edição para garantir que começa do zero
    sessionStorage.removeItem('editingFunnelTemplate');
    
    if (isInDashboard) {
      navigate('/dashboard/tools/funnelfy/editor');
    } else {
      navigate('/tools/funnelfy/editor');
    }
  };

  // Função para editar um modelo de funil
  const handleEditUserTemplate = (templateId: string) => {
    // Verifica se estamos no dashboard pela URL atual
    const isInDashboard = location.pathname.includes('/dashboard');
    
    // Encontrar o modelo pelo ID
    const template = userTemplates.find(t => t.id === templateId);
    
    if (template) {
      console.log("=========== PREPARANDO PARA EDITAR MODELO ===========");
      console.log("Modelo selecionado:", template.title);
      console.log("Número de elementos:", template.steps.length);
      
      // Log detalhado de cada elemento
      template.steps.forEach((step: any, index: number) => {
        console.log(`Elemento ${index + 1}: ${step.name} (${step.id})`);
        console.log(`  Tipo: ${step.type}`);
        console.log(`  IconType: ${step.iconType || 'não definido'}`);
      });
      
      // Salvar modelo em sessionStorage para ser carregado no editor
      sessionStorage.setItem('editingFunnelTemplate', JSON.stringify(template));
      console.log("Modelo salvo no sessionStorage para edição");
      console.log("=========== FIM DA PREPARAÇÃO PARA EDIÇÃO ===========");
      
      if (isInDashboard) {
        navigate('/dashboard/tools/funnelfy/editor');
      } else {
        navigate('/tools/funnelfy/editor');
      }
    }
  };

  // Função para iniciar processo de exclusão de modelo
  const handleInitDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede a propagação do evento para não selecionar o template
    setTemplateToDelete(templateId);
    setShowDeleteModal(true);
  };

  // Função para confirmar exclusão de modelo
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await funnelService.deleteFunnel(templateToDelete);
      
      // Atualizar estado local
      const updatedTemplates = userTemplates.filter(t => t.id !== templateToDelete);
      setUserTemplates(updatedTemplates);
    } catch (error) {
      console.error("Erro ao excluir modelo:", error);
    }
    
    // Fechar modal
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  // Função para renderizar o ícone a partir da string
  const renderIcon = (iconType: string) => {
    console.log(`Renderizando ícone para tipo: ${iconType}`);
    
    // Remover o sufixo "-icon" se presente
    const cleanType = iconType?.replace(/-icon$/, '') || '';
    console.log(`  Tipo limpo: ${cleanType}`);
    
    // Verificar se iconType é undefined ou string vazia
    if (!iconType) {
      console.log(`  → Tipo de ícone não definido, usando padrão`);
      return <FileText size={20} />;
    }

    // Mapeamento completo de ícones
    const iconMap: { [key: string]: JSX.Element } = {
      // Ícones de redes sociais
      'tiktok': <FileText size={20} />,
      'TikTok': <FileText size={20} />,
      'whatsapp': <MessageCircle size={20} />,
      'WhatsApp': <MessageCircle size={20} />,
      'youtube': <Youtube size={20} />,
      'Youtube': <Youtube size={20} />,
      'instagram': <Instagram size={20} />,
      'Instagram': <Instagram size={20} />,
      'facebook': <Facebook size={20} />,
      'Facebook': <Facebook size={20} />,
      'linkedin': <Linkedin size={20} />,
      'Linkedin': <Linkedin size={20} />,
      'linkedin-icon': <Linkedin size={20} />,
      'twitter': <Twitter size={20} />,
      'Twitter': <Twitter size={20} />,
      'pinterest': <Image size={20} />,
      'Pinterest': <Image size={20} />,
      'camera': <Camera size={20} />,
      'Camera': <Camera size={20} />,
      'send': <Send size={20} />,
      'Send': <Send size={20} />,
      
      // Outros ícones comuns
      'mail': <Mail size={20} />,
      'Mail': <Mail size={20} />,
      'share2': <Share2 size={20} />,
      'Share2': <Share2 size={20} />,
      'link': <Link size={20} />,
      'Link': <Link size={20} />,
      'shoppingcart': <ShoppingCart size={20} />,
      'ShoppingCart': <ShoppingCart size={20} />,
      'phonecall': <PhoneCall size={20} />,
      'PhoneCall': <PhoneCall size={20} />,
      'phone': <Phone size={20} />,
      'Phone': <Phone size={20} />,
      'globe': <Globe size={20} />,
      'Globe': <Globe size={20} />,
      'filetext': <FileText size={20} />,
      'FileText': <FileText size={20} />,
      
      // Outros ícones para tipos de funil
      'gitfork': <GitFork size={20} />,
      'GitFork': <GitFork size={20} />,
      'creditcard': <CreditCard size={20} />,
      'CreditCard': <CreditCard size={20} />,
      'gift': <Gift size={20} />,
      'Gift': <Gift size={20} />,
      'messagesquare': <MessageSquare size={20} />,
      'MessageSquare': <MessageSquare size={20} />,
      'smartphone': <Smartphone size={20} />,
      'Smartphone': <Smartphone size={20} />,
      'video': <Video size={20} />,
      'Video': <Video size={20} />,
      'star': <Star size={20} />,
      'Star': <Star size={20} />,
      'grid3x3': <Grid3X3 size={20} />,
      'Grid3X3': <Grid3X3 size={20} />,
      'check': <Check size={20} />,
      'Check': <Check size={20} />,
      'dollarsign': <DollarSign size={20} />,
      'DollarSign': <DollarSign size={20} />,
      'zap': <Zap size={20} />,
      'Zap': <Zap size={20} />
    };
    
    // Verificar mapeamento com tipo simples (case insensitive)
    const lowercaseType = cleanType.toLowerCase();
    
    // Verificar no mapa de ícones (case insensitive)
    for (const [key, icon] of Object.entries(iconMap)) {
      if (key.toLowerCase() === lowercaseType) {
        console.log(`  → Encontrado ícone para ${iconType} → ${key}`);
        return icon;
      }
    }
    
    // Verificar pelo conteúdo para compatibilidade
    if (lowercaseType.includes('tiktok')) {
      console.log(`  → Identificado como TikTok pelo nome`);
      return iconMap['TikTok'];
    }
    if (lowercaseType.includes('linkedin')) {
      console.log(`  → Identificado como LinkedIn pelo nome`);
      return iconMap['Linkedin'];
    }
    if (lowercaseType.includes('whatsapp')) {
      console.log(`  → Identificado como WhatsApp pelo nome`);
      return iconMap['WhatsApp'];
    }
    if (lowercaseType.includes('instagram')) {
      console.log(`  → Identificado como Instagram pelo nome`);
      return iconMap['Instagram'];
    }
    if (lowercaseType.includes('facebook')) {
      console.log(`  → Identificado como Facebook pelo nome`);
      return iconMap['Facebook'];
    }
    if (lowercaseType.includes('youtube')) {
      console.log(`  → Identificado como YouTube pelo nome`);
      return iconMap['Youtube'];
    }
    if (lowercaseType.includes('twitter')) {
      console.log(`  → Identificado como Twitter pelo nome`);
      return iconMap['Twitter'];
    }
    if (lowercaseType.includes('telegram')) {
      console.log(`  → Identificado como Telegram pelo nome`);
      return iconMap['Send'];
    }
    
    // Tipos de elementos por categoria
    const typeCategories: { [key: string]: JSX.Element } = {
      'social': iconMap['Share2'] || <Share2 size={20} />,
      'link': iconMap['Link'] || <Link size={20} />,
      'venda': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      'vendas': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      'contato': iconMap['PhoneCall'] || <PhoneCall size={20} />,
      
      // Tipos adicionais de funil
      'leads': iconMap['FileText'] || <FileText size={20} />,
      'membership': iconMap['CreditCard'] || <CreditCard size={20} />,
      'saas': iconMap['Grid3X3'] || <Grid3X3 size={20} />,
      'ecommerce': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      
      // Tipos de página
      'landing': iconMap['FileText'] || <FileText size={20} />,
      'checkout': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      'thankyou': iconMap['Check'] || <Check size={20} />,
      'webinar': iconMap['Video'] || <Video size={20} />,
      'sales': iconMap['DollarSign'] || <DollarSign size={20} />,
      'upsell': iconMap['Zap'] || <Zap size={20} />,
      'downsell': iconMap['Gift'] || <Gift size={20} />,
      'optin': iconMap['Mail'] || <Mail size={20} />,
      'order': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      'survey': iconMap['MessageCircle'] || <MessageCircle size={20} />,
      
      // Ações
      'email': iconMap['Mail'] || <Mail size={20} />,
      'sms': iconMap['Smartphone'] || <Smartphone size={20} />,
      'payment': iconMap['CreditCard'] || <CreditCard size={20} />,
      'delay': iconMap['Clock'] || <Clock size={20} />,
      'condition': iconMap['GitFork'] || <GitFork size={20} />,
      
      // Tipos para compatibilidade
      'web': iconMap['Globe'] || <Globe size={20} />,
      'marketing': iconMap['ShoppingCart'] || <ShoppingCart size={20} />,
      'conversions': iconMap['DollarSign'] || <DollarSign size={20} />,
      'lead': iconMap['User'] || <User size={20} />
    };
    
    // Verificar nas categorias
    if (typeCategories[lowercaseType]) {
      console.log(`  → Encontrado no mapa de categorias de elemento: ${lowercaseType}`);
      return typeCategories[lowercaseType];
    }
    
    // Verificar correspondências parciais nas categorias
    for (const [key, icon] of Object.entries(typeCategories)) {
      if (lowercaseType.includes(key)) {
        console.log(`  → Correspondência parcial na categoria: ${key}`);
        return icon;
      }
    }
    
    console.log(`  → Não foi possível identificar o tipo [${iconType}], usando ícone padrão (FileText)`);
    return <FileText size={20} />;
  };

  // Variáveis simplificadas sem filtros
  const hasUserTemplates = userTemplates.length > 0;
  // Removido filtro por tipo, exibindo todos os modelos diretamente
  const modelsToDisplay = userTemplates;

  // Função para iniciar compartilhamento de modelo
  const handleShareTemplate = (templateId: string, templateTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede a propagação do evento para não selecionar o template
    setTemplateToShare({ id: templateId, title: templateTitle });
    setShowShareModal(true);
  };

  // Função para abrir modal de importação
  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  // Função chamada quando um funil é importado com sucesso
  const handleImportSuccess = (funnelId: string) => {
    // Recarregar a lista de funis após importação bem-sucedida
    const loadUserTemplates = async () => {
      setIsLoading(true);
      try {
        const templates = await funnelService.getAllFunnels();
        setUserTemplates(templates);
      } catch (error) {
        console.error("Erro ao recarregar modelos de funil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserTemplates();
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-emerald-50 p-4 md:p-6 rounded-t-xl border-b border-emerald-100"
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-emerald-800 font-bold text-lg md:text-xl mb-2">
                Crie Funis de Vendas com Funnel Builder 
                <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-medium align-middle">BETA</span>
              </h2>
              <p className="text-emerald-700 text-sm md:text-base">
                Com o Funnel Builder, você pode criar funis de vendas profissionais em minutos. Escolha um modelo pré-pronto, personalize cada etapa e aumente suas conversões.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-between items-center p-6 border-b"
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-500">
              <GitFork className="text-emerald-500" />
              Funnel Builder
              <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-medium">BETA</span>
            </h1>
            <div className="ml-4 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              {modelsToDisplay.length} modelos disponíveis
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleOpenImportModal}
              className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <Share2 size={16} />
              <span>Importar funil</span>
            </button>

            <button 
              onClick={handleCreateCustomFunnel}
              className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <PlusCircle size={16} />
              <span>Criar do zero</span>
            </button>
          </div>
        </motion.div>

        <div className="p-6">
          {/* Título da seção */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Meus modelos de funil</h2>
          </div>
          
          {/* Mensagem quando não há modelos */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-lg text-gray-600">Carregando seus funis...</span>
            </div>
          ) : modelsToDisplay.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <PlusCircle size={30} className="text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum modelo disponível</h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não tem modelos personalizados. Crie seu funil do zero e salve-o como modelo para reutilizá-lo quando precisar.
                </p>
                <button
                  onClick={handleCreateCustomFunnel}
                  className="inline-flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <PlusCircle size={18} />
                  <span>Criar funil do zero</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelsToDisplay.map((template) => (
              <motion.div
                key={template.id}
                className={`
                    border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
                    hover:border-emerald-200 hover:shadow-md
                `}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEditUserTemplate(template.id)}
              >
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600">
                        {renderIcon(template.icon)}
                    </div>
                    <h4 className="font-medium text-gray-800">{template.title}</h4>
                  </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => handleInitDeleteTemplate(template.id, e)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 mr-1"
                        title="Excluir modelo"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => handleShareTemplate(template.id, template.title, e)}
                        className="p-1.5 rounded text-gray-400 hover:text-blue-500 mr-1"
                        title="Compartilhar modelo"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUserTemplate(template.id);
                        }}
                        className="p-1.5 rounded text-gray-400 hover:text-emerald-600"
                        title="Editar modelo"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                </div>
                
                <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description || "Sem descrição"}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
                      <div>
                        Criado em: {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                      <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {template.steps.length} elementos
                      </div>
                    </div>
                      </div>
                    </motion.div>
              ))}
              
              {/* Card para criar novo funil */}
              <motion.div
                className="border border-dashed border-gray-300 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-emerald-300 flex items-center justify-center p-8"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateCustomFunnel}
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle size={30} className="text-emerald-600" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Criar novo funil</h4>
                  <p className="text-sm text-gray-600">
                    Comece do zero e crie um funil personalizado
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
          </div>
          
      {/* Modal de confirmação para excluir */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="p-5 border-b">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h3 className="text-lg font-semibold">Excluir modelo</h3>
              </div>
              <p className="text-gray-600">
                Tem certeza que deseja excluir este modelo de funil? Esta ação não pode ser desfeita.
              </p>
            </div>
            
            <div className="p-5 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            <button 
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Excluir
            </button>
          </div>
          </motion.div>
        </div>
      )}

      {/* Modal de compartilhamento */}
      {showShareModal && templateToShare && (
        <FunnelShareModal
          funnelId={templateToShare.id}
          funnelTitle={templateToShare.title}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setTemplateToShare(null);
          }}
        />
      )}

      {/* Modal de importação */}
      {showImportModal && (
        <ImportFunnelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Modal de boas-vindas da versão beta */}
      {showBetaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <GitFork size={24} className="mr-2" />
                  <h3 className="text-xl font-bold">Bem-vindo ao Funnel Builder Beta</h3>
                </div>
                <span className="bg-white text-emerald-600 text-xs px-2 py-1 rounded-full font-bold">BETA</span>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                🚀 Estamos entusiasmados em apresentar o <strong>Funnel Builder</strong>, nossa mais nova ferramenta para criar funis de vendas profissionais!
              </p>
              
              <p className="text-gray-700 mb-4">
                Como você é um dos primeiros a experimentar esta ferramenta, gostaríamos de informar que ela está em fase <strong>beta</strong>. Isso significa que estamos trabalhando continuamente para aprimorá-la com novos recursos e melhorias.
              </p>
              
              <p className="text-gray-700 mb-4">
                Sua opinião é extremamente valiosa para nós! Se encontrar algum bug ou tiver sugestões de melhorias, por favor, compartilhe com nossa equipe de suporte. Cada feedback nos ajuda a tornar o Funnel Builder ainda mais incrível.
              </p>
              
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4">
                <p className="text-emerald-700 text-sm">
                  <strong>Dica:</strong> Comece criando um funil do zero ou importe um modelo compartilhado por outro usuário. Você pode salvar seus funis como modelos para reutilizá-los no futuro.
                </p>
              </div>
            </div>
            
            <div className="p-5 bg-gray-50 flex justify-end">
              <button 
                onClick={closeBetaModal}
                className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-sm flex items-center space-x-2"
              >
                <span>Vamos começar!</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default FunnelFy; 