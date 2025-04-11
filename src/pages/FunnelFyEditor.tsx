import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Save, Download, ChevronDown, Share2, 
  Mail, CreditCard, Gift, ShoppingCart, MessageCircle, 
  Award, Video, FileText, Facebook, Instagram, Youtube, 
  Smartphone, Linkedin, Clock, Check, Percent, DollarSign,
  BarChart2, GitFork, Zap, Plus, Minus, Trash2, X,
  MousePointer, Move, AlignCenter, AlignLeft, AlignRight, 
  Grid, ZoomIn, ZoomOut, Settings, Maximize, Image, Copy,
  ArrowRight, PenTool, Layout, Search, Eye, Code, HelpCircle,
  MaximizeIcon, CornerRightDown, Twitter, Camera, Send, BookOpen, Star, Scale, Calendar, CalendarCheck, Phone, UserPlus,
  ShoppingCart as ShoppingCartIcon, Target as TargetIcon, Smartphone as SmartphoneIcon, Bell, RefreshCw, Ticket, Users,
  User, Hand, BookmarkPlus, Grid3X3, MessageSquare, Link as LinkIcon, PhoneCall, Globe,
  Crop, Layers, MoveDownRight, MoveLeft, MoveRight, MoveUpLeft, MoveUpRight,
  FileVideo
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Tipagens
interface FunnelStep {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: number; // Fator de escala: 1 = tamanho padrão, 1.5 = 50% maior, etc.
  icon: React.ReactNode;
  connections: string[];
  label?: string;
  notes?: string;
  colorScheme?: string; // Novo campo para estilo de cores
  stats?: {
    views?: number;
    conversions?: number;
    rate?: number;
  };
  iconType?: string; // Novo campo para tipo de ícone
}

// Nova interface para a versão serializável do FunnelStep (sem o icon)
interface SerializableFunnelStep {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size: number; // Adicionar propriedade size
  connections: string[];
  label?: string;
  notes?: string;
  stats?: {
    views?: number;
    conversions?: number;
    rate?: number;
  },
  iconType?: string; // Adicionar propriedade iconType
}

type ConnectionPoint = 'top' | 'right' | 'bottom' | 'left';

type DragItem = {
  type: string;
  name: string;
  icon: React.ReactNode;
} | null;

// Componente que renderiza um ponto de conexão com posicionamento absoluto
const ConnectionPoint = ({ 
  position, 
  isActive, 
  stepId, 
  onClickHandler, 
  elementWidth,
  elementHeight,
  onMouseEnter,
  onMouseLeave
}: { 
  position: 'top' | 'right' | 'bottom' | 'left', 
  isActive: boolean, 
  stepId: string,
  onClickHandler: (e: React.MouseEvent) => void,
  elementWidth: number,
  elementHeight: number,
  onMouseEnter: () => void,
  onMouseLeave: () => void
}) => {
  // Não precisa mais calcular a posição pois já está posicionado pela div pai
  return (
    <div 
      className={`bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg connection-point
        ${isActive ? 'animate-pulse' : 'opacity-70 hover:opacity-100'}
        transition-all duration-150 scale-90 hover:scale-100
      `}
      onClick={onClickHandler}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isActive ? 
        <X size={14} /> : 
        <div className="w-2 h-2 bg-white rounded-full" />
      }
    </div>
  );
};

// Interface para modelo salvo
interface SavedFunnelTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  steps: SerializableFunnelStep[];
  icon: string; // Nome do ícone (como string)
  createdAt: string;
  lastModifiedAt: string;
}

const FunnelFyEditor: React.FC = () => {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [draggedItem, setDraggedItem] = useState<DragItem>(null);
  const [lines, setLines] = useState<{from: string, to: string, points: {x: number, y: number}[], fromPoint: string, toPoint: string}[]>([]);
  const [funnelName, setFunnelName] = useState("Meu Funil Personalizado");
  const editorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Novas variáveis de estado
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<string>('pointer');
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [historyStack, setHistoryStack] = useState<SerializableFunnelStep[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'json'>('png');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState("sales");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Estado para controle de arrasto
  const [dragStartPosition, setDragStartPosition] = useState<{x: number, y: number} | null>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);
  const [activeFromPoint, setActiveFromPoint] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);

  // Estado para controle de redimensionamento
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const [resizeStartPosition, setResizeStartPosition] = useState<{x: number, y: number} | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<number>(1);
  const [editingColor, setEditingColor] = useState<string | null>(null);

  // Adicionar estado para controlar a visualização dos controles
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  
  // Novos estados para a ferramenta de mão (navegação pelo editor com arrasto)
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const [isSpaceKeyDown, setIsSpaceKeyDown] = useState(false);
  const [handDragStart, setHandDragStart] = useState<{x: number, y: number} | null>(null);
  const previousActiveTool = useRef<string>('pointer');

  // Referência para a área de conteúdo
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Determinar a URL de retorno baseada na localização atual
  const backUrl = location.pathname.includes('/dashboard') 
    ? '/dashboard/tools/funnelfy' 
    : '/tools/funnelfy';

  // Esquemas de cores disponíveis
  const colorSchemes = {
    default: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-emerald-300',
      iconBgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      ringColor: 'ring-emerald-500',
    },
    blue: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-blue-300',
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      ringColor: 'ring-blue-500',
    },
    purple: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-purple-300',
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      ringColor: 'ring-purple-500',
    },
    amber: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-amber-300',
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      ringColor: 'ring-amber-500',
    },
    rose: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-rose-300',
      iconBgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      ringColor: 'ring-rose-500',
    },
    teal: {
      bgColor: 'bg-white',
      borderColor: 'border-transparent hover:border-teal-300',
      iconBgColor: 'bg-teal-50',
      iconColor: 'text-teal-500',
      ringColor: 'ring-teal-500',
    },
  };

  // Ícones disponíveis para os elementos do funil
  const elementIcons = {
    social: {
      facebook: <Facebook size={20} />,
      instagram: <Instagram size={20} />,
      youtube: <Youtube size={20} />,
      linkedin: <Linkedin size={20} />,
      whatsapp: <Smartphone size={20} />,
      twitter: <Twitter size={20} />,
      tiktok: <Video size={20} />,
      pinterest: <Image size={20} />,
      snapchat: <Camera size={20} />,
      telegram: <Send size={20} />,
      reddit: <MessageCircle size={20} />,
    },
    web: {
      landingPage: <FileText size={20} />,
      salesPage: <DollarSign size={20} />,
      checkoutPage: <CreditCard size={20} />,
      thankYouPage: <Check size={20} />,
      upsellPage: <Zap size={20} />,
      webinar: <Video size={20} />,
      blogPost: <BookOpen size={20} />,
      reviewPage: <Star size={20} />,
      compareProduct: <Scale size={20} />,
      portfolioPage: <Layout size={20} />,
    },
    marketing: {
      email: <Mail size={20} />,
      notification: <MessageCircle size={20} />,
      discount: <Percent size={20} />,
      bonus: <Gift size={20} />,
      survey: <FileText size={20} />,
      timer: <Clock size={20} />,
      autoresponder: <RefreshCw size={20} />,
      coupon: <Ticket size={20} />,
      affiliate: <Users size={20} />,
      sms: <SmartphoneIcon size={20} />,
      push: <Bell size={20} />,
      retargeting: <TargetIcon size={20} />,
      abandonedCart: <ShoppingCartIcon size={20} />,
    },
    conversions: {
      lead: <User size={20} />,
      customer: <Award size={20} />,
      sale: <ShoppingCart size={20} />,
      revenue: <BarChart2 size={20} />,
      subscriber: <Mail size={20} />,
      download: <Download size={20} />,
      signup: <UserPlus size={20} />,
      booking: <Calendar size={20} />,
      reservation: <Clock size={20} />,
      appointment: <CalendarCheck size={20} />,
      consultation: <Phone size={20} />,
    }
  };

  // Elementos disponíveis para arrastar
  const availableElements = [
    { 
      category: "Tráfego e Social", 
      items: [
        { id: "facebook", type: "social", name: "Facebook", icon: elementIcons.social.facebook },
        { id: "instagram", type: "social", name: "Instagram", icon: elementIcons.social.instagram },
        { id: "youtube", type: "social", name: "YouTube", icon: elementIcons.social.youtube },
        { id: "linkedin", type: "social", name: "LinkedIn", icon: elementIcons.social.linkedin },
        { id: "twitter", type: "social", name: "Twitter", icon: elementIcons.social.twitter },
        { id: "tiktok", type: "social", name: "TikTok", icon: elementIcons.social.tiktok },
        { id: "pinterest", type: "social", name: "Pinterest", icon: elementIcons.social.pinterest },
        { id: "whatsapp", type: "social", name: "WhatsApp", icon: elementIcons.social.whatsapp },
        { id: "telegram", type: "social", name: "Telegram", icon: elementIcons.social.telegram },
        { id: "snapchat", type: "social", name: "Snapchat", icon: elementIcons.social.snapchat },
        { id: "reddit", type: "social", name: "Reddit", icon: elementIcons.social.reddit },
      ] 
    },
    { 
      category: "Páginas Web", 
      items: [
        { id: "landingPage", type: "web", name: "Landing Page", icon: elementIcons.web.landingPage },
        { id: "salesPage", type: "web", name: "Página de Vendas", icon: elementIcons.web.salesPage },
        { id: "checkoutPage", type: "web", name: "Checkout", icon: elementIcons.web.checkoutPage },
        { id: "thankYouPage", type: "web", name: "Página de Obrigado", icon: elementIcons.web.thankYouPage },
        { id: "upsellPage", type: "web", name: "Upsell", icon: elementIcons.web.upsellPage },
        { id: "webinar", type: "web", name: "Webinar", icon: elementIcons.web.webinar },
        { id: "blogPost", type: "web", name: "Post de Blog", icon: elementIcons.web.blogPost },
        { id: "reviewPage", type: "web", name: "Página de Avaliações", icon: elementIcons.web.reviewPage },
        { id: "compareProduct", type: "web", name: "Comparação de Produtos", icon: elementIcons.web.compareProduct },
        { id: "portfolioPage", type: "web", name: "Portfólio", icon: elementIcons.web.portfolioPage },
      ] 
    },
    { 
      category: "Marketing", 
      items: [
        { id: "email", type: "marketing", name: "Email", icon: elementIcons.marketing.email },
        { id: "notification", type: "marketing", name: "Notificação", icon: elementIcons.marketing.notification },
        { id: "discount", type: "marketing", name: "Desconto", icon: elementIcons.marketing.discount },
        { id: "bonus", type: "marketing", name: "Bônus", icon: elementIcons.marketing.bonus },
        { id: "survey", type: "marketing", name: "Pesquisa", icon: elementIcons.marketing.survey },
        { id: "timer", type: "marketing", name: "Cronômetro", icon: elementIcons.marketing.timer },
        { id: "autoresponder", type: "marketing", name: "Autoresponder", icon: elementIcons.marketing.autoresponder },
        { id: "coupon", type: "marketing", name: "Cupom", icon: elementIcons.marketing.coupon },
        { id: "affiliate", type: "marketing", name: "Afiliado", icon: elementIcons.marketing.affiliate },
        { id: "sms", type: "marketing", name: "SMS", icon: elementIcons.marketing.sms },
        { id: "push", type: "marketing", name: "Push", icon: elementIcons.marketing.push },
        { id: "retargeting", type: "marketing", name: "Retargeting", icon: elementIcons.marketing.retargeting },
        { id: "abandonedCart", type: "marketing", name: "Carrinho Abandonado", icon: elementIcons.marketing.abandonedCart },
      ] 
    },
    { 
      category: "Conversões", 
      items: [
        { id: "lead", type: "conversions", name: "Lead", icon: elementIcons.conversions.lead },
        { id: "customer", type: "conversions", name: "Cliente", icon: elementIcons.conversions.customer },
        { id: "sale", type: "conversions", name: "Venda", icon: elementIcons.conversions.sale },
        { id: "revenue", type: "conversions", name: "Receita", icon: elementIcons.conversions.revenue },
        { id: "subscriber", type: "conversions", name: "Assinante", icon: elementIcons.conversions.subscriber },
        { id: "download", type: "conversions", name: "Download", icon: elementIcons.conversions.download },
        { id: "signup", type: "conversions", name: "Cadastro", icon: elementIcons.conversions.signup },
        { id: "booking", type: "conversions", name: "Agendamento", icon: elementIcons.conversions.booking },
        { id: "reservation", type: "conversions", name: "Reserva", icon: elementIcons.conversions.reservation },
        { id: "appointment", type: "conversions", name: "Consulta", icon: elementIcons.conversions.appointment },
        { id: "consultation", type: "conversions", name: "Atendimento", icon: elementIcons.conversions.consultation },
      ] 
    },
  ];

  // Expandir/colapsar categorias
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    availableElements.map(category => category.category)
  );

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(cat => cat !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  // Funções para manipular o arrastar e soltar
  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Calcular a posição considerando o zoom e o scroll
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    const offsetX = editorRef.current?.scrollLeft || 0;
    const offsetY = editorRef.current?.scrollTop || 0;
    
    const x = ((e.clientX - editorRect.left + offsetX) / (zoom / 100)) - 50;
    const y = ((e.clientY - editorRect.top + offsetY) / (zoom / 100)) - 40;
    
    // Criar um novo elemento no diagrama
    const newElement: FunnelStep = {
      id: uuidv4(),
      type: draggedItem.type,
      name: draggedItem.name,
      position: { x, y },
      size: 1, // Tamanho padrão
      icon: draggedItem.icon,
      connections: [],
      colorScheme: 'default', // Esquema de cores padrão
    };
    
    const newSteps = [...steps, newElement];
    setSteps(newSteps);
    saveToHistory(newSteps);
    
    setDraggedItem(null);
  };

  // Manipulação de clique nos elementos
  const handleElementClick = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    
    if (activeTool === 'connect') {
      // Ferramenta de conexão está ativa
      if (connecting === stepId) {
        setConnecting(null);
      } else if (connecting) {
        createConnection(stepId);
      } else {
        setConnecting(stepId);
      }
      return;
    } else if (activeTool === 'pointer') {
      // Editar elemento com duplo clique
      if (e.detail === 2) {
        handleEditStep(stepId);
        return;
      }
      
      // Ferramenta de seleção está ativa
      if (e.shiftKey) {
        // Adição à seleção múltipla com Shift
        if (selectedSteps.includes(stepId)) {
          setSelectedSteps(selectedSteps.filter(id => id !== stepId));
        } else {
          setSelectedSteps([...selectedSteps, stepId]);
        }
      } else {
        // Seleção única sem Shift
        if (selectedSteps.length === 1 && selectedSteps[0] === stepId) {
          setSelectedSteps([]);
        } else {
          setSelectedSteps([stepId]);
        }
      }
    }
  };

  // Manipulação de clique no fundo do editor (para limpar seleção)
  const handleEditorClick = (e: React.MouseEvent) => {
    // Não limpar a seleção se estamos no modo mão
    if (isHandToolActive || activeTool === 'hand') {
      return;
    }
    
    if (activeTool === 'connect' && connecting) {
      setConnecting(null);
    } else {
      setSelectedSteps([]);
    }
  };

  // Implementação melhorada para arrastar elementos
  const handleElementDragStart = (e: React.DragEvent<HTMLDivElement>, stepId: string) => {
    e.stopPropagation();
    
    // Se não estiver na seleção atual, seleciona este elemento
    if (!selectedSteps.includes(stepId)) {
      if (e.shiftKey) {
        setSelectedSteps([...selectedSteps, stepId]);
      } else {
        setSelectedSteps([stepId]);
      }
    }
    
    setConnecting(null);
    
    // Definir dados de transferência
    e.dataTransfer.setData('text/plain', stepId);
    
    // Indicar que estamos arrastando seleção múltipla se for o caso
    if (selectedSteps.length > 1) {
      e.dataTransfer.setData('isMultiple', 'true');
    }
  };
  
  // Implementação melhorada para soltar elementos
  const handleElementDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Obter dados de transferência
    const stepId = e.dataTransfer.getData('text/plain');
    const isMultiple = e.dataTransfer.getData('isMultiple') === 'true';
    
    if (!stepId) return;
    
    // Calcular a nova posição considerando o zoom
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    const x = (e.clientX - editorRect.left) / (zoom / 100);
    const y = (e.clientY - editorRect.top) / (zoom / 100);
    
    // Obter o elemento base que foi arrastado
    const draggedStep = steps.find(step => step.id === stepId);
    if (!draggedStep) return;
    
    // Calcular deslocamento
    const deltaX = x - draggedStep.position.x;
    const deltaY = y - draggedStep.position.y;
    
    let updatedSteps = [...steps];
    
    if (isMultiple) {
      // Mover todos os elementos selecionados com o mesmo deslocamento relativo
      updatedSteps = steps.map(step => {
        if (selectedSteps.includes(step.id)) {
          return {
            ...step,
            position: {
              x: step.position.x + deltaX,
              y: step.position.y + deltaY
            }
          };
        }
        return step;
      });
    } else {
      // Mover apenas o elemento arrastado
      updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, position: { x, y } } : step
      );
    }
    
    setSteps(updatedSteps);
  };

  // Criar uma conexão entre dois elementos
  const createConnection = (targetId: string, fromPoint: 'top' | 'right' | 'bottom' | 'left' = 'bottom', toPoint: 'top' | 'right' | 'bottom' | 'left' = 'top') => {
    if (connecting === null) return;
    
    // Evitar conexões com o mesmo elemento
    if (connecting === targetId) {
      setConnecting(null);
      setActiveFromPoint(null);
      return;
    }
    
    // Evitar conexões duplicadas
    const sourceStep = steps.find(step => step.id === connecting);
    if (!sourceStep) {
      setConnecting(null);
      setActiveFromPoint(null);
      return;
    }
    
    // Verificar se a conexão já existe
    if (sourceStep.connections.includes(targetId)) {
      setConnecting(null);
      setActiveFromPoint(null);
      return;
    }
    
    // Verificar se é uma conexão válida (não criar ciclos)
    const isValid = !checkCycleCreation(connecting, targetId);
    
    if (isValid) {
      // Criar a nova conexão
      const newSteps = steps.map(step => 
        step.id === connecting ? 
        { ...step, connections: [...step.connections, targetId] } : 
        step
      );
      
      setSteps(newSteps);
      saveToHistory(newSteps);
    }
    
    // Resetar estado de conexão
    setConnecting(null);
    setActiveFromPoint(null);
  };

  // Verificar se uma nova conexão criaria um ciclo no diagrama
  const checkCycleCreation = (sourceId: string, targetId: string): boolean => {
    // Função para verificar se há um caminho de um nó para outro
    const hasPath = (from: string, to: string, visited: Set<string> = new Set()): boolean => {
      if (from === to) return true;
      if (visited.has(from)) return false;
      
      visited.add(from);
      const step = steps.find(s => s.id === from);
      if (!step) return false;
      
      for (const connId of step.connections) {
        if (hasPath(connId, to, visited)) return true;
      }
      
      return false;
    };
    
    // Se já existe um caminho de targetId para sourceId, então criar uma conexão
    // de sourceId para targetId criaria um ciclo
    return hasPath(targetId, sourceId);
  };

  // Função para remover uma conexão entre elementos
  const removeConnection = (sourceId: string, targetId: string) => {
    // Encontrar o elemento de origem e remover a conexão
    const updatedSteps = steps.map(step => {
      if (step.id === sourceId) {
        return {
          ...step,
          connections: step.connections.filter(conn => conn !== targetId)
        };
      }
      return step;
    });
    
    setSteps(updatedSteps);
    saveToHistory(updatedSteps);
    
    // Limpar estado de hoveredConnection
    setHoveredConnection(null);
  };

  // Função para remover um elemento do funil
  const removeElement = (stepId: string) => {
    // Remover o elemento
    const newSteps = steps.filter(step => step.id !== stepId);
    
    // Remover todas as conexões que apontam para este elemento
    const finalSteps = newSteps.map(step => ({
      ...step,
      connections: step.connections.filter(id => id !== stepId)
    }));
    
    setSteps(finalSteps);
    setSelectedSteps(selectedSteps.filter(id => id !== stepId));
  };

  // Cálculo melhorado das linhas de conexão para criar curvas mais suaves e respeitar os pontos de conexão
  useEffect(() => {
    const newLines: {from: string, to: string, points: {x: number, y: number}[], fromPoint: string, toPoint: string}[] = [];
    
    steps.forEach(step => {
      step.connections.forEach(targetId => {
        const targetStep = steps.find(s => s.id === targetId);
        if (targetStep) {
          // Tamanho base do elemento
          const baseElementWidth = 96; // w-24 = 6rem = 96px
          const baseElementHeight = 80; // aproximadamente
          
          // Aplicar o fator de escala ao tamanho do elemento
          const sourceScale = (step as any).size || 1;
          const targetScale = (targetStep as any).size || 1;
          
          // Ajustar largura com base no tipo (web, social, marketing)
          let sourceWidth = baseElementWidth;
          let sourceHeight = baseElementHeight;
          let targetWidth = baseElementWidth;
          let targetHeight = baseElementHeight;
          
          // Ajustar tamanhos baseados no tipo
          if (step.type === "web") {
            sourceWidth = 80; // w-20
            sourceHeight = 112; // h-28
          } else if (step.type === "social") {
            sourceWidth = 80; // w-20
            sourceHeight = 80; // h-20
          } else if (step.type === "marketing") {
            sourceWidth = 112; // w-28
            sourceHeight = 80; // h-20
          }
          
          if (targetStep.type === "web") {
            targetWidth = 80; // w-20
            targetHeight = 112; // h-28
          } else if (targetStep.type === "social") {
            targetWidth = 80; // w-20
            targetHeight = 80; // h-20
          } else if (targetStep.type === "marketing") {
            targetWidth = 112; // w-28
            targetHeight = 80; // h-20
          }
          
          // Aplicar escala
          sourceWidth = sourceWidth * sourceScale;
          sourceHeight = sourceHeight * sourceScale;
          targetWidth = targetWidth * targetScale;
          targetHeight = targetHeight * targetScale;

          // Determinar pontos iniciais e finais baseados no tipo de conexão
          // Por padrão, usamos bottom -> top
          let fromPoint = 'bottom';
          let toPoint = 'top';
          
          // Lógica para determinar os melhores pontos de conexão com base nas posições relativas
          const sourceX = step.position.x;
          const sourceY = step.position.y;
          const targetX = targetStep.position.x;
          const targetY = targetStep.position.y;
          
          // Calcular os centros de cada elemento considerando o tamanho
          const sourceCenterX = sourceX + sourceWidth / 2;
          const sourceCenterY = sourceY + sourceHeight / 2;
          const targetCenterX = targetX + targetWidth / 2;
          const targetCenterY = targetY + targetHeight / 2;
          
          // Se o alvo está à direita e mais ou menos na mesma altura
          if (targetCenterX > sourceCenterX && Math.abs(targetCenterY - sourceCenterY) < (sourceHeight + targetHeight) / 2) {
            fromPoint = 'right';
            toPoint = 'left';
          } 
          // Se o alvo está à esquerda e mais ou menos na mesma altura
          else if (targetCenterX < sourceCenterX && Math.abs(targetCenterY - sourceCenterY) < (sourceHeight + targetHeight) / 2) {
            fromPoint = 'left';
            toPoint = 'right';
          }
          // Se o alvo está abaixo (já é o padrão)
          else if (targetCenterY > sourceCenterY) {
            fromPoint = 'bottom';
            toPoint = 'top';
          }
          // Se o alvo está acima
          else if (targetCenterY < sourceCenterY) {
            fromPoint = 'top';
            toPoint = 'bottom';
          }

          // Calcular os pontos de início e fim com base nos pontos de conexão e escala
          let startPoint = {x: 0, y: 0};
          let endPoint = {x: 0, y: 0};
          
          // Ponto de início (origem) - ajustado com escala
          switch (fromPoint) {
            case 'top':
              startPoint = {
                x: sourceX + sourceWidth / 2,
                y: sourceY,
              };
              break;
            case 'right':
              startPoint = {
                x: sourceX + sourceWidth,
                y: sourceY + sourceHeight / 2,
              };
              break;
            case 'bottom':
              startPoint = {
                x: sourceX + sourceWidth / 2,
                y: sourceY + sourceHeight,
              };
              break;
            case 'left':
              startPoint = {
                x: sourceX,
                y: sourceY + sourceHeight / 2,
              };
              break;
          }
          
          // Ponto de fim (destino) - ajustado com escala
          switch (toPoint) {
            case 'top':
              endPoint = {
                x: targetX + targetWidth / 2,
                y: targetY,
              };
              break;
            case 'right':
              endPoint = {
                x: targetX + targetWidth,
                y: targetY + targetHeight / 2,
              };
              break;
            case 'bottom':
              endPoint = {
                x: targetX + targetWidth / 2,
                y: targetY + targetHeight,
              };
              break;
            case 'left':
              endPoint = {
                x: targetX,
                y: targetY + targetHeight / 2,
              };
              break;
          }
          
          // Calcular pontos de controle para a curva Bezier
          // Ajusta os pontos de controle com base nos pontos de conexão
          const controlPoint1 = { x: startPoint.x, y: startPoint.y };
          const controlPoint2 = { x: endPoint.x, y: endPoint.y };
          
          // Distância para os pontos de controle (ajuste conforme necessário)
          const distance = Math.min(80, Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + 
            Math.pow(endPoint.y - startPoint.y, 2)
          ) * 0.4);
          
          // Ajustar pontos de controle com base no ponto de conexão
          switch (fromPoint) {
            case 'top':
              controlPoint1.y -= distance;
              break;
            case 'right':
              controlPoint1.x += distance;
              break;
            case 'bottom':
              controlPoint1.y += distance;
              break;
            case 'left':
              controlPoint1.x -= distance;
              break;
          }
          
          switch (toPoint) {
            case 'top':
              controlPoint2.y -= distance;
              break;
            case 'right':
              controlPoint2.x += distance;
              break;
            case 'bottom':
              controlPoint2.y += distance;
              break;
            case 'left':
              controlPoint2.x -= distance;
              break;
          }
          
          newLines.push({
            from: step.id,
            to: targetId,
            points: [startPoint, controlPoint1, controlPoint2, endPoint],
            fromPoint,
            toPoint
          });
        }
      });
    });
    
    setLines(newLines);
  }, [steps]);

  // Efeito para centralizar o conteúdo inicialmente
  useEffect(() => {
    if (editorRef.current && contentAreaRef.current) {
      // Centralizar o conteúdo na área do editor
      const editorWidth = editorRef.current.clientWidth;
      const editorHeight = editorRef.current.clientHeight;
      
      // Calcular o ponto central
      const scrollLeft = (10000 - editorWidth) / 2;
      const scrollTop = (10000 - editorHeight) / 2;
      
      // Definir a posição de scroll
      editorRef.current.scrollLeft = scrollLeft;
      editorRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Função para alterar o zoom
  const handleZoom = (newZoom: number) => {
    if (editorRef.current) {
      // Obter o centro da área visível
      const centerX = editorRef.current.scrollLeft + editorRef.current.clientWidth / 2;
      const centerY = editorRef.current.scrollTop + editorRef.current.clientHeight / 2;
      
      // Calcular o fator de escala
      const oldZoom = zoom / 100;
      const zoomLevel = Math.max(50, Math.min(200, newZoom));
      const newZoomFactor = zoomLevel / 100;
      
      // Aplicar o novo zoom
      setZoom(zoomLevel);
      
      // Ajustar o scroll para manter o centro
      if (editorRef.current) {
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const newCenterX = centerX * (newZoomFactor / oldZoom);
            const newCenterY = centerY * (newZoomFactor / oldZoom);
            
            editorRef.current.scrollLeft = newCenterX - editorRef.current.clientWidth / 2;
            editorRef.current.scrollTop = newCenterY - editorRef.current.clientHeight / 2;
          }
        });
      }
    } else {
      const zoomLevel = Math.max(50, Math.min(200, newZoom));
      setZoom(zoomLevel);
    }
  };

  // Função para salvar no histórico sem causar erro de estrutura circular
  const saveToHistory = (newSteps: FunnelStep[]) => {
    try {
      // Limpa o histórico à frente se estamos no meio do histórico
      const newHistory = historyStack.slice(0, historyIndex + 1);
      
      // Cria uma versão serializável dos passos (sem as referências circulares do ReactNode)
      const serializableSteps: SerializableFunnelStep[] = newSteps.map(step => ({
        id: step.id,
        type: step.type,
        name: step.name,
        position: { ...step.position },
        size: step.size || 1, // Garantir que size seja incluído
        // Omitimos o ícone React que causa o problema de serialização
        connections: [...step.connections],
        label: step.label,
        notes: step.notes,
        stats: step.stats ? { ...step.stats } : undefined,
        iconType: step.iconType
      }));
      
      // Adiciona o novo estado serializável ao histórico
      newHistory.push(serializableSteps);
      
      // Atualiza o histórico e o índice
      setHistoryStack(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error("Erro ao salvar no histórico:", error);
    }
  };

  // Undo implementado para trabalhar com objetos serializáveis
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      
      // Recuperar o estado anterior e recriar os ícones
      const previousState = historyStack[historyIndex - 1];
      
      // Restaurar os passos anteriores com seus ícones
      const restoredSteps: FunnelStep[] = previousState.map(step => {
        // Encontrar o ícone correspondente ao tipo
        const iconMap = elementIcons as any;
        let icon = null;
        
        for (const category in iconMap) {
          if (iconMap[category][step.id.split('-')[0]]) {
            icon = iconMap[category][step.id.split('-')[0]];
            break;
          }
        }
        
        return {
          ...step,
          size: step.size || 1, // Garantir que size esteja definido
          icon: icon || <div>Ícone não encontrado</div>, // Fallback para garantir que icon não seja null
        };
      });
      
      setSteps(restoredSteps);
    }
  };

  // Redo implementado para trabalhar com objetos serializáveis
  const redo = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      
      // Recuperar o próximo estado e recriar os ícones
      const nextState = historyStack[historyIndex + 1];
      
      // Restaurar os passos com seus ícones
      const restoredSteps: FunnelStep[] = nextState.map(step => {
        // Encontrar o ícone correspondente ao tipo
        const iconMap = elementIcons as any;
        let icon = null;
        
        for (const category in iconMap) {
          if (iconMap[category][step.id.split('-')[0]]) {
            icon = iconMap[category][step.id.split('-')[0]];
            break;
          }
        }
        
        return {
          ...step,
          size: step.size || 1, // Garantir que size esteja definido
          icon: icon || <div>Ícone não encontrado</div>, // Fallback para garantir que icon não seja null
        };
      });
      
      setSteps(restoredSteps);
    }
  };

  // Adicionar ao histórico quando steps mudar (versão melhorada)
  useEffect(() => {
    // Só salvamos no histórico se houver passos E uma das condições for verdadeira:
    // 1. Não há histórico ainda
    // 2. O índice atual do histórico é -1 (estado inicial) 
    // 3. Os passos atuais são diferentes dos passos no histórico atual
    if (steps.length > 0 && (
      historyStack.length === 0 || 
      historyIndex === -1 || 
      !compareSteps(steps, historyIndex)
    )) {
      saveToHistory(steps);
    }
  }, [steps]);

  // Função auxiliar para comparar os passos atuais com os do histórico
  const compareSteps = (currentSteps: FunnelStep[], historyIdx: number): boolean => {
    if (historyIdx < 0 || historyIdx >= historyStack.length) return false;
    
    const historySteps = historyStack[historyIdx];
    if (currentSteps.length !== historySteps.length) return false;
    
    // Comparamos apenas os IDs e posições para determinar se houve mudança
    // Não comparamos ícones (que causam o problema de serialização)
    for (let i = 0; i < currentSteps.length; i++) {
      const current = currentSteps[i];
      const history = historySteps[i];
      
      if (current.id !== history.id) return false;
      if (current.position.x !== history.position.x || current.position.y !== history.position.y) return false;
      if (current.connections.length !== history.connections.length) return false;
      
      for (let j = 0; j < current.connections.length; j++) {
        if (current.connections[j] !== history.connections[j]) return false;
      }
    }
    
    return true;
  };

  // Funções para alinhamento de elementos
  const alignElements = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedSteps.length < 2) return;
    
    const selectedElements = steps.filter(step => selectedSteps.includes(step.id));
    
    if (direction === 'left' || direction === 'center' || direction === 'right') {
      // Alinhamento horizontal
      let targetX;
      if (direction === 'left') {
        targetX = Math.min(...selectedElements.map(el => el.position.x));
      } else if (direction === 'right') {
        targetX = Math.max(...selectedElements.map(el => el.position.x));
      } else {
        // Centro
        const minX = Math.min(...selectedElements.map(el => el.position.x));
        const maxX = Math.max(...selectedElements.map(el => el.position.x));
        targetX = minX + (maxX - minX) / 2;
      }
      
      setSteps(steps.map(step => {
        if (selectedSteps.includes(step.id)) {
          return {
            ...step,
            position: {
              ...step.position,
              x: direction === 'center' ? targetX - 50 : targetX // Ajuste para centralizar
            }
          };
        }
        return step;
      }));
    } else {
      // Alinhamento vertical
      let targetY;
      if (direction === 'top') {
        targetY = Math.min(...selectedElements.map(el => el.position.y));
      } else if (direction === 'bottom') {
        targetY = Math.max(...selectedElements.map(el => el.position.y));
      } else {
        // Meio
        const minY = Math.min(...selectedElements.map(el => el.position.y));
        const maxY = Math.max(...selectedElements.map(el => el.position.y));
        targetY = minY + (maxY - minY) / 2;
      }
      
      setSteps(steps.map(step => {
        if (selectedSteps.includes(step.id)) {
          return {
            ...step,
            position: {
              ...step.position,
              y: direction === 'middle' ? targetY - 40 : targetY // Ajuste para centralizar
            }
          };
        }
        return step;
      }));
    }
  };

  // Duplicar elementos selecionados
  const duplicateSelected = () => {
    if (selectedSteps.length === 0) return;
    
    const newElements = selectedSteps.map(id => {
      const original = steps.find(step => step.id === id);
      if (!original) return null;
      
      return {
        ...original,
        id: `${original.id}-copy-${Date.now()}`,
        position: {
          x: original.position.x + 20,
          y: original.position.y + 20
        },
        connections: []
      };
    }).filter(Boolean) as FunnelStep[];
    
    setSteps([...steps, ...newElements]);
    setSelectedSteps(newElements.map(el => el.id));
  };

  // Remover elementos selecionados
  const removeSelected = () => {
    if (selectedSteps.length === 0) return;
    
    // Remover os elementos selecionados
    const newSteps = steps.filter(step => !selectedSteps.includes(step.id));
    
    // Remover conexões para os elementos removidos
    const finalSteps = newSteps.map(step => ({
      ...step,
      connections: step.connections.filter(id => !selectedSteps.includes(id))
    }));
    
    setSteps(finalSteps);
    setSelectedSteps([]);
  };

  // Função para exportar o funil como imagem
  const exportAsImage = () => {
    if (!editorRef.current) return;
    
    // Implementação simples - em um caso real, você usaria uma biblioteca como html2canvas
    alert('A exportação como imagem seria implementada usando bibliotecas como html2canvas ou usando a API Canvas para capturar o conteúdo do DOM.');
    
    setShowExportModal(false);
  };
  
  // Função para exportar o funil como JSON, corrigida para evitar ciclos
  const exportAsJSON = () => {
    try {
      // Preparar dados para exportação - remover referências circulares
      const exportData = {
        name: funnelName,
        steps: steps.map(step => ({
          id: step.id,
          type: step.type,
          name: step.name,
          position: { ...step.position },
          connections: [...step.connections],
          label: step.label,
          notes: step.notes,
          stats: step.stats ? { ...step.stats } : undefined
          // Nota: O ícone (React.ReactNode) é omitido deliberadamente para evitar ciclos
        }))
      };
      
      // Criar um blob com os dados JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar um link e simular o clique para iniciar o download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${funnelName.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error("Erro ao exportar para JSON:", error);
      alert("Não foi possível exportar para JSON. Verifique o console para mais detalhes.");
    }
  };
  
  // Manipulador para editar propriedades de um elemento
  const handleEditStep = (stepId: string) => {
    setEditingStep(stepId);
  };
  
  // Função para atualizar um elemento
  const updateStep = (stepId: string, updates: Partial<FunnelStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    setEditingStep(null);
  };

  // Função para fechar o tutorial
  const closeTutorial = () => {
    setShowTutorial(false);
    // Poderia salvar uma preferência no localStorage para não mostrar novamente
  };

  // Função para iniciar o arrasto
  const handleMouseDown = (e: React.MouseEvent, stepId: string) => {
    // Não iniciar arrasto se estivermos no modo mão ou outra ferramenta que não seja mover ou ponteiro
    if (activeTool !== 'move' && activeTool !== 'pointer') return;
    
    // Não iniciar arrasto em pontos de conexão ou botões
    if (
      (e.target as HTMLElement).closest('.connection-point') || 
      (e.target as HTMLElement).closest('.remove-btn')
    ) {
      return;
    }
    
    // Selecionar o elemento se ele ainda não estiver selecionado
    if (!selectedSteps.includes(stepId)) {
      if (e.shiftKey) {
        setSelectedSteps([...selectedSteps, stepId]);
      } else {
        setSelectedSteps([stepId]);
      }
    }
    
    e.preventDefault();
    e.stopPropagation(); // Impedir interação com outras áreas
    
    // Guardar a posição inicial do mouse
    setDragStartPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    setDraggingElement(stepId);
    setIsDragging(true);
    
    // Adicionar event listeners para mouse move e mouse up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Efeito para inicializar o histórico quando a página carrega
  useEffect(() => {
    if (steps.length > 0 && historyStack.length === 0) {
      saveToHistory(steps);
    }
  }, [steps]);

  // Efeito para limpar event listeners quando o componente desmonta
  useEffect(() => {
    // Limpeza quando o componente é desmontado
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Lida com o comportamento do movimento temporário durante o arrasto
  const handleMoveDuringDrag = useCallback((e: MouseEvent) => {
    if (!dragStartPosition || !draggingElement) return;
    
    // Calcular o deslocamento considerando o zoom
    const dx = (e.clientX - dragStartPosition.x) / (zoom / 100);
    const dy = (e.clientY - dragStartPosition.y) / (zoom / 100);
    
    // Atualizar a posição dos elementos visualmente durante o arrasto
    const elements = document.querySelectorAll('.funnel-element');
    elements.forEach(el => {
      const stepId = el.getAttribute('data-id');
      if (!stepId) return;
      
      if (stepId === draggingElement || (selectedSteps.includes(stepId) && selectedSteps.includes(draggingElement))) {
        const step = steps.find(s => s.id === stepId);
        if (!step) return;
        
        const newX = step.position.x + dx;
        const newY = step.position.y + dy;
        
        (el as HTMLElement).style.left = `${newX}px`;
        (el as HTMLElement).style.top = `${newY}px`;
      }
    });
  }, [dragStartPosition, draggingElement, zoom, selectedSteps, steps]);

  // Atualiza os handlers de movimento e finalização de arrasto quando necessário
  useEffect(() => {
    // Se estamos arrastando, atualize os event listeners
    if (isDragging) {
      // Remova listeners antigos para evitar duplicação
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Adicione os listeners atualizados
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // Se não estamos arrastando, remova os listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      // Limpar listeners ao desmontar ou quando o estado de arrasto mudar
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMoveDuringDrag]);

  // Função para definir elemento hover com segurança
  const setHoveredElementSafe = (id: string | null) => {
    if (id !== undefined) {
      setHoveredElement(id);
    }
  };

  // Função para definir ponto hover com segurança
  const setHoveredPointSafe = (point: 'top' | 'right' | 'bottom' | 'left' | null) => {
    if (point !== undefined) {
      setHoveredPoint(point);
    }
  };

  // Mover elementos durante o arrasto
  const handleMouseMove = (e: MouseEvent) => {
    // Se estamos no modo mão, não permitir mover elementos
    if (activeTool === 'hand' || isHandToolActive) return;
    
    if (!dragStartPosition || !draggingElement) return;
    
    // Obter o elemento de editor para calcular posições relativas
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    // Calcular o deslocamento considerando o zoom
    const dx = (e.clientX - dragStartPosition.x) / (zoom / 100);
    const dy = (e.clientY - dragStartPosition.y) / (zoom / 100);
    
    // Atualizar a posição dos elementos visualmente durante o arrasto
    const elements = document.querySelectorAll('.funnel-element');
    elements.forEach(el => {
      const stepId = el.getAttribute('data-id');
      if (!stepId) return;
      
      if (stepId === draggingElement || (selectedSteps.includes(stepId) && selectedSteps.includes(draggingElement))) {
        const step = steps.find(s => s.id === stepId);
        if (!step) return;
        
        const newX = step.position.x + dx;
        const newY = step.position.y + dy;
        
        (el as HTMLElement).style.left = `${newX}px`;
        (el as HTMLElement).style.top = `${newY}px`;
      }
    });
  };

  // Finalizar o arrasto
  const handleMouseUp = (e: MouseEvent) => {
    if (!dragStartPosition || !draggingElement) return;
    
    // Calcular o deslocamento final considerando o zoom
    const dx = (e.clientX - dragStartPosition.x) / (zoom / 100);
    const dy = (e.clientY - dragStartPosition.y) / (zoom / 100);
    
    // Atualizar as posições no estado
    const updatedSteps = steps.map(step => {
      if (step.id === draggingElement || (selectedSteps.includes(step.id) && selectedSteps.includes(draggingElement))) {
        return {
          ...step,
          position: {
            x: step.position.x + dx,
            y: step.position.y + dy
          }
        };
      }
      return step;
    });
    
    setSteps(updatedSteps);
    saveToHistory(updatedSteps);
    
    // Fazer uma limpeza completa dos estados
    cleanupDragStates();
    
    // Remover event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Função para adicionar um novo elemento ao funil
  const addElement = (x: number, y: number, item: DragItem) => {
    if (!item) return;

    // Determinar o iconType baseado no ID do elemento
    let iconType: string;
    const itemId = item.type.toLowerCase();
    
    // Verificar por tipos específicos
    if (itemId === 'facebook') iconType = 'Facebook';
    else if (itemId === 'instagram') iconType = 'Instagram';
    else if (itemId === 'youtube') iconType = 'Youtube';
    else if (itemId === 'linkedin') iconType = 'Linkedin';
    else if (itemId === 'twitter') iconType = 'Twitter';
    else if (itemId === 'tiktok') iconType = 'TikTok';
    else if (itemId === 'pinterest') iconType = 'Pinterest';
    else if (itemId === 'whatsapp') iconType = 'WhatsApp';
    else if (itemId === 'telegram') iconType = 'Send';
    else if (itemId === 'snapchat') iconType = 'Camera';
    else if (itemId === 'reddit') iconType = 'MessageCircle';
    else if (item.type === 'social') iconType = 'Share2';
    else if (item.type === 'web') iconType = 'Globe';
    else if (item.type === 'marketing') iconType = 'ShoppingCart';
    else if (item.type === 'conversions') iconType = 'DollarSign';
    else if (item.type === 'lead') iconType = 'User';
    else iconType = 'FileText';
    
    console.log(`Adicionando elemento: ${item.name}, tipo: ${item.type}, iconType: ${iconType}`);
    
    const newStep: FunnelStep = {
      id: `${item.type}-${uuidv4()}`,
      type: item.type,
      name: item.name,
      position: { x, y },
      size: 1, // Tamanho padrão
      icon: item.icon,
      connections: [],
      colorScheme: 'default', // Esquema de cores padrão
      iconType: iconType // Adicionar iconType
    };
    
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    saveToHistory(newSteps);
  };

  // Função para iniciar o redimensionamento
  const handleResizeStart = (e: React.MouseEvent, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    setResizingElement(stepId);
    setResizeStartPosition({
      x: e.clientX,
      y: e.clientY
    });
    setResizeStartSize((step as any).size || 1);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Mover durante o redimensionamento
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingElement || !resizeStartPosition || !resizeStartSize) return;

    const step = steps.find(s => s.id === resizingElement);
    if (!step) return;

    // Calcular a distância diagonal do movimento
    const dx = (e.clientX - resizeStartPosition.x) / (zoom / 100);
    const dy = (e.clientY - resizeStartPosition.y) / (zoom / 100);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Determinar se estamos aumentando ou diminuindo com base na direção diagonal
    const direction = dx + dy > 0 ? 1 : -1;
    
    // Ajustar o fator de tamanho (limitar entre 0.5 e 3)
    let newSize = resizeStartSize + (direction * distance * 0.01);
    newSize = Math.max(0.5, Math.min(3, newSize));

    // Atualizar visualmente o elemento durante o redimensionamento
    const element = document.querySelector(`[data-id="${resizingElement}"]`);
    if (element) {
      (element as HTMLElement).style.transform = `scale(${newSize})`;
    }
  };

  // Finalizar o redimensionamento
  const handleResizeEnd = (e: MouseEvent) => {
    if (!resizingElement || !resizeStartPosition || !resizeStartSize) return;

    const step = steps.find(s => s.id === resizingElement);
    if (!step) return;

    // Calcular o tamanho final
    const dx = (e.clientX - resizeStartPosition.x) / (zoom / 100);
    const dy = (e.clientY - resizeStartPosition.y) / (zoom / 100);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const direction = dx + dy > 0 ? 1 : -1;
    
    let newSize = resizeStartSize + (direction * distance * 0.01);
    newSize = Math.max(0.5, Math.min(3, newSize));

    // Atualizar o estado com o novo tamanho
    const updatedSteps = steps.map(s => 
      s.id === resizingElement 
        ? { ...s, size: newSize } 
        : s
    );
    
    setSteps(updatedSteps as any);
    saveToHistory(updatedSteps as any);

    // Limpar o estado de redimensionamento com nossa função unificada
    cleanupDragStates();

    // Remover event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Limpar event listeners ao desmontar o componente para redimensionamento
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // Atualizar elementos existentes ao inicializar
  useEffect(() => {
    // Adicionar a propriedade size para elementos existentes, se necessário
    const updatedSteps = steps.map(step => {
      if (step.size === undefined) {
        return { ...step, size: 1 };
      }
      return step;
    });
    
    // Apenas atualizar se houver alguma mudança
    if (JSON.stringify(steps) !== JSON.stringify(updatedSteps)) {
      setSteps(updatedSteps);
    }
  }, []);

  // Função para selecionar a cor de um elemento
  const selectElementColor = (stepId: string, colorScheme: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, colorScheme } : step
    );
    
    setSteps(updatedSteps);
    saveToHistory(updatedSteps);
    setEditingColor(null);
  };

  // Modificar a renderização dos elementos do painel para ter formatos específicos por tipo
  const renderPanelItem = (item: any) => {
    // Determinar a classe específica com base no tipo
    let additionalClasses = "";
    let contentStyle = "";
    
    if (item.type === "web") {
      // Formato de página para elementos web - atualizado com base na referência
      additionalClasses = "h-28 aspect-[3/4] flex-col justify-between relative overflow-hidden p-0 border-2 border-emerald-500";
      contentStyle = "bg-white flex-col items-center justify-between py-2 px-1 h-full";
    } else if (item.type === "social") {
      // Formato quadrado para redes sociais
      additionalClasses = "aspect-square";
      contentStyle = "";
    } else if (item.type === "marketing") {
      // Formato horizontal para marketing
      additionalClasses = "w-full";
      contentStyle = "";
    } else {
      // Formato padrão para outros
      additionalClasses = "";
      contentStyle = "";
    }
    
    return (
      <div
        key={item.id}
        className={`bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-center cursor-grab hover:border-emerald-300 hover:shadow-sm text-center ${additionalClasses}`}
        draggable
        onDragStart={(e) => handleDragStart(item)}
      >
        {item.type === "web" ? (
          // Novo layout para elementos de página web
          <>
            {/* Barra de navegação estilizada */}
            <div className="w-full h-5 bg-emerald-500 absolute top-0 left-0 flex items-center justify-between px-1.5">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
              </div>
              <div className="text-white text-[8px] font-medium truncate">
                {item.id === "landingPage" ? "Lead" :
                 item.id === "salesPage" ? "Venda" :
                 item.id === "checkoutPage" ? "Pagamento" :
                 item.id === "thankYouPage" ? "Sucesso" :
                 item.id === "upsellPage" ? "Oferta" :
                 item.id === "webinar" ? "Webinar" :
                 item.id === "blogPost" ? "Blog" :
                 item.id === "reviewPage" ? "Reviews" :
                 item.id === "compareProduct" ? "Comparativo" :
                 item.id === "portfolioPage" ? "Portfólio" :
                 "Página"}
              </div>
            </div>
            
            <div className={`w-full ${contentStyle}`}>
              {/* Elemento de conteúdo estilizado como uma página web */}
              <div className="w-full h-3 bg-emerald-100 rounded mb-1"></div>
              <div className="w-full h-8 flex items-center justify-center mb-1">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-full text-emerald-500">
                  {item.icon}
                </div>
              </div>
              <div className="w-3/4 h-2 bg-emerald-100 rounded mb-1 mx-auto"></div>
              <div className="w-2/3 h-2 bg-emerald-100 rounded mx-auto"></div>
              
              {/* Botão estilizado */}
              <div className="mt-1.5 w-full mx-auto">
                <div className="bg-emerald-500 text-white text-[9px] py-1 px-1 rounded-md font-medium text-center">
                  {item.id === "landingPage" ? "CAPTURAR" :
                   item.id === "salesPage" ? "COMPRAR" :
                   item.id === "checkoutPage" ? "CHECKOUT" :
                   item.id === "thankYouPage" ? "OBRIGADO" :
                   item.id === "upsellPage" ? "UPSELL" :
                   item.id === "webinar" ? "ASSISTIR" :
                   item.id === "blogPost" ? "LER MAIS" :
                   item.id === "reviewPage" ? "REVIEWS" :
                   item.id === "compareProduct" ? "COMPARAR" :
                   item.id === "portfolioPage" ? "PORTFÓLIO" :
                   "ACESSAR"}
                </div>
              </div>
              
              <span className="text-xs font-semibold text-gray-800 truncate max-w-full mt-1">
                {item.name}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-full mb-1 text-emerald-500">
              {item.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 truncate max-w-full">
              {item.name}
            </span>
          </>
        )}
      </div>
    );
  };

  // Adicionar manipuladores de eventos para teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se estiver em um campo de entrada de texto, não interferir
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        // Permitir comportamento normal em campos de texto
        return;
      }
      
      // Tecla espaço para ativar ferramenta de mão
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsHandToolActive(true);
      }
      
      // Apagar elementos selecionados com Delete ou Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSteps.length > 0) {
        e.preventDefault();
        removeSelected();
      }
      
      // Desfazer com Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Refazer com Ctrl+Shift+Z ou Ctrl+Y
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
          (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      }
      
      // Atalhos adicionais...
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Se estiver em um campo de entrada de texto, não interferir
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        // Permitir comportamento normal em campos de texto
        return;
      }
      
      // Desativar ferramenta de mão ao soltar espaço
      if (e.code === 'Space') {
        setIsHandToolActive(false);
      }
    };
    
    // Adicionar os listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Limpar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsHandToolActive]);

  // Manipuladores para arrastar com a ferramenta de mão
  const handleHandToolMouseDown = (e: React.MouseEvent) => {
    // Só acionar se estamos no modo mão
    if (activeTool !== 'hand' && !isHandToolActive) return;
    
    e.preventDefault();
    e.stopPropagation(); // Impedir que outros handlers sejam chamados
    
    // Mudar o cursor para "grabbing" (mão fechada)
    if (editorRef.current) {
      editorRef.current.style.cursor = 'grabbing';
    }
    
    // Limpar quaisquer outros estados que possam estar ativos
    setDragStartPosition(null);
    setDraggingElement(null);
    setIsDragging(false);
    setResizingElement(null);
    setResizeStartPosition(null);
    
    // Certifique-se que não há conexões ativas
    setConnecting(null);
    
    // Definir o ponto de início do arrasto
    setHandDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleHandToolMouseMove = (e: React.MouseEvent) => {
    // Só processar se estamos no modo mão e temos um ponto de início definido
    if ((activeTool !== 'hand' && !isHandToolActive) || !handDragStart) return;
    
    e.preventDefault();
    e.stopPropagation(); // Impedir que outros handlers sejam chamados
    
    const dx = handDragStart.x - e.clientX;
    const dy = handDragStart.y - e.clientY;
    
    // Ajustar o scroll do container do editor
    if (editorRef.current) {
      editorRef.current.scrollLeft += dx / (zoom / 100);
      editorRef.current.scrollTop += dy / (zoom / 100);
    }
    
    // Atualizar posição inicial para o próximo movimento
    setHandDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleHandToolMouseUp = (e: React.MouseEvent) => {
    // Só processar se temos um ponto de início definido (estávamos arrastando)
    if (!handDragStart) return;
    
    e.preventDefault();
    e.stopPropagation(); // Impedir que outros handlers sejam chamados
    
    // Mudar o cursor de volta para "grab" (mão aberta)
    if (editorRef.current) {
      editorRef.current.style.cursor = 'grab';
    }
    
    // Limpar o estado de arrasto
    setHandDragStart(null);
  };

  // Adicionar manipulador para sair da tela
  const handleHandToolMouseLeave = (e: React.MouseEvent) => {
    // Só processar se temos um ponto de início definido (estávamos arrastando)
    if (!handDragStart) return;
    
    // Limpar o estado de arrasto
    setHandDragStart(null);
    
    // Restaurar cursor se o mouse sair da área
    if (editorRef.current) {
      editorRef.current.style.cursor = (isHandToolActive || activeTool === 'hand') ? 'grab' : 'default';
    }
  };

  // Função para limpar completamente o estado de arrasto e restaurar o cursor
  const cleanupDragStates = () => {
    // Limpar todos os estados de arrasto
    setHandDragStart(null);
    setDragStartPosition(null);
    setDraggingElement(null);
    setIsDragging(false);
    setResizingElement(null);
    setResizeStartPosition(null);
    
    // Remover todos os manipuladores de eventos globais
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // Limpar qualquer elemento que possa estar sendo arrastado visualmente
    if (contentAreaRef.current) {
      const elements = contentAreaRef.current.querySelectorAll('.funnel-element');
      elements.forEach((el) => {
        const element = el as HTMLElement;
        if (element.style.transform.includes('translate')) {
          // Resetar qualquer transformação temporária
          element.style.transform = element.style.transform.replace(/translate\([^)]*\)/g, '');
        }
      });
    }
    
    // Restaurar o cursor baseado na ferramenta ativa
    if (editorRef.current) {
      if (activeTool === 'hand' || isHandToolActive) {
        editorRef.current.style.cursor = 'grab';
      } else {
        editorRef.current.style.cursor = '';
      }
    }
  };

  // Efeito para limpar estados quando a ferramenta muda
  useEffect(() => {
    // Quando a ferramenta muda, limpar estados de arrasto
    cleanupDragStates();
    
    // Restaurar cursor apropriado
    if (editorRef.current) {
      if (activeTool === 'hand') {
        editorRef.current.style.cursor = 'grab';
      } else {
        editorRef.current.style.cursor = '';
      }
    }
  }, [activeTool]);

  // Função para alterar a ferramenta ativa
  const setActiveToolSafely = (tool: string) => {
    // Limpar estados antes de mudar a ferramenta
    cleanupDragStates();
    
    // Se estamos saindo do modo mão, garantir que o cursor seja restaurado
    if (activeTool === 'hand' && tool !== 'hand') {
      if (editorRef.current) {
        editorRef.current.style.cursor = '';
      }
    }
    
    // Se estamos entrando no modo mão, configurar o cursor apropriado
    if (tool === 'hand') {
      if (editorRef.current) {
        editorRef.current.style.cursor = 'grab';
      }
    }
    
    setActiveTool(tool);
  };

  // Efeito para limpar tudo quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Certifique-se de limpar todos os estados e manipuladores de eventos
      cleanupDragStates();
    };
  }, []);

  // Efeito para atualizar o cursor quando o modo mão muda
  useEffect(() => {
    if (editorRef.current) {
      if (isHandToolActive || activeTool === 'hand') {
        // Se o modo mão está ativo e não estamos arrastando
        editorRef.current.style.cursor = handDragStart ? 'grabbing' : 'grab';
      } else {
        // Restaure o cursor normal para outras ferramentas
        editorRef.current.style.cursor = '';
      }
    }
  }, [isHandToolActive, activeTool, handDragStart]);

  // Efeito adicional para garantir que o cursor seja atualizado imediatamente
  useEffect(() => {
    // Forçar o cursor correto quando a ferramenta muda
    if (editorRef.current) {
      if (activeTool === 'hand') {
        editorRef.current.style.cursor = 'grab';
      } else {
        editorRef.current.style.cursor = '';
      }
    }
  }, [activeTool]);

  // Função para converter o ícone em string para armazenamento
  const iconToString = (icon: React.ReactNode): string => {
    if (!icon) return "GitFork";
    
    // Verifica o tipo do componente e extrai o nome do ícone
    const iconType = (icon as any)?.type?.name;
    return iconType || "GitFork";
  };
  
  // Função para converter string de volta para o componente de ícone
  const stringToIcon = (iconName: string): React.ReactNode => {
    const iconMap: { [key: string]: React.ReactNode } = {
      GitFork: <GitFork size={20} />,
      Mail: <Mail size={20} />,
      CreditCard: <CreditCard size={20} />,
      Gift: <Gift size={20} />,
      ShoppingCart: <ShoppingCart size={20} />,
      MessageCircle: <MessageCircle size={20} />,
      Award: <Award size={20} />,
      Video: <Video size={20} />,
      FileText: <FileText size={20} />,
      Facebook: <Facebook size={20} />,
      Instagram: <Instagram size={20} />,
      Youtube: <Youtube size={20} />,
      Smartphone: <Smartphone size={20} />,
      Linkedin: <Linkedin size={20} />,
      Clock: <Clock size={20} />,
      Check: <Check size={20} />,
      Percent: <Percent size={20} />,
      DollarSign: <DollarSign size={20} />,
      // Adicione mais ícones conforme necessário
    };
    
    return iconMap[iconName] || <GitFork size={20} />;
  };

  // Função para salvar o funil atual como um modelo
  const saveAsTemplate = async () => {
    if (!templateTitle.trim()) return;
    
    // Converter os passos para um formato serializável
    const serializableSteps = steps.map(step => {
      // Garantir que o iconType seja preservado
      // Se não houver iconType, determinar com base no ícone ou tipo
      let iconType = step.iconType;
      
      // Se não houver iconType, tentar determinar com base no nome, ID ou tipo
      if (!iconType) {
        const stepId = step.id.split('-')[0].toLowerCase();
        
        // Verificar por plataformas sociais no ID ou nome
        if (stepId.includes('tiktok') || step.name.toLowerCase().includes('tiktok')) {
          iconType = 'TikTok';
        } else if (stepId.includes('linkedin') || step.name.toLowerCase().includes('linkedin')) {
          iconType = 'Linkedin';
        } else if (stepId.includes('facebook') || step.name.toLowerCase().includes('facebook')) {
          iconType = 'Facebook';
        } else if (stepId.includes('instagram') || step.name.toLowerCase().includes('instagram')) {
          iconType = 'Instagram';
        } else if (stepId.includes('whatsapp') || step.name.toLowerCase().includes('whatsapp')) {
          iconType = 'WhatsApp';
        } else if (stepId.includes('youtube') || step.name.toLowerCase().includes('youtube')) {
          iconType = 'Youtube';
        } else if (stepId.includes('twitter') || step.name.toLowerCase().includes('twitter')) {
          iconType = 'Twitter';
        } else if (stepId.includes('telegram') || step.name.toLowerCase().includes('telegram')) {
          iconType = 'Send';
        } else if (stepId.includes('pinterest') || step.name.toLowerCase().includes('pinterest')) {
          iconType = 'Pinterest';
        } else {
          // Se não for uma rede social específica, usar o tipo do elemento
          switch (step.type) {
            case 'social':
              iconType = 'Share2';
              break;
            case 'web':
              iconType = 'Globe';
              break;
            case 'marketing':
              iconType = 'ShoppingCart';
              break;
            case 'conversions':
              iconType = 'DollarSign';
              break;
            case 'lead':
              iconType = 'User';
              break;
            default:
              iconType = 'FileText';
          }
        }
      }

      console.log(`Salvando passo: ${step.name}, tipo: ${step.type}, iconType: ${iconType}`);
      
      const { icon, ...rest } = step;
      return {
        ...rest,
        iconType // Explicitamente incluir o iconType no objeto serializado
      };
    });
    
    // Determinar o ícone principal com base no tipo de funil
    let mainIcon = "GitFork";
    
    // Se tivermos passos, usar o ícone do primeiro passo
    if (steps.length > 0 && steps[0].icon) {
      mainIcon = iconToString(steps[0].icon);
    }
    
    // Usar ícone baseado no tipo do funil
    switch (templateType) {
      case 'sales':
        mainIcon = "ShoppingCart";
        break;
      case 'leads':
        mainIcon = "FileText";
        break;
      case 'webinar':
        mainIcon = "Video";
        break;
      case 'launch':
        mainIcon = "Gift";
        break;
      case 'membership':
        mainIcon = "CreditCard";
        break;
      case 'saas':
        mainIcon = "Grid3X3";
        break;
      case 'ecommerce':
        mainIcon = "ShoppingCart";
        break;
      case 'survey':
        mainIcon = "MessageSquare";
        break;
      default:
        // Manter o ícone padrão ou do primeiro passo
        break;
    }
    
    // Verificar se estamos editando um modelo existente
    const editingTemplateStr = sessionStorage.getItem('editingFunnelTemplate');
    let editingTemplateId: string | null = null;
    
    if (editingTemplateStr) {
      try {
        const editingTemplate = JSON.parse(editingTemplateStr);
        editingTemplateId = editingTemplate.id;
        console.log("Editando modelo existente com ID:", editingTemplateId);
      } catch (e) {
        console.error("Erro ao recuperar modelo em edição:", e);
      }
    }
    
    // Importar o serviço de funis
    const { funnelService } = await import('../services/funnelService');
    
    // Criar o objeto de modelo
    const template: SavedFunnelTemplate = {
      id: editingTemplateId || uuidv4(),
      type: templateType,
      title: templateTitle,
      description: templateDescription,
      steps: serializableSteps,
      icon: mainIcon,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString()
    };
    
    console.log("Salvando modelo de funil:", template);
    
    try {
      // Salvar usando o funnelService
      const savedTemplate = await funnelService.saveFunnel(template);
      console.log("Modelo salvo com sucesso:", savedTemplate);
      
      // Mostrar mensagem de sucesso
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveTemplateModal(false);
        
        // Limpar campos do formulário
        setTemplateTitle("");
        setTemplateDescription("");
        
        // Limpar sessionStorage
        sessionStorage.removeItem('editingFunnelTemplate');
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar modelo de funil:", error);
      alert("Ocorreu um erro ao salvar o modelo. Por favor, tente novamente.");
    }
  };
  
  // Efeito para carregar um template se estiver sendo editado
  useEffect(() => {
    const loadSavedTemplate = () => {
      const editingTemplate = sessionStorage.getItem('editingFunnelTemplate');
      if (editingTemplate) {
        try {
          const template = JSON.parse(editingTemplate);
          
          // Atualizar o nome do funil
          setFunnelName(template.title);
          
          // Pré-preencher os campos do formulário de salvar modelo
          setTemplateTitle(template.title);
          setTemplateDescription(template.description || "");
          setTemplateType(template.type);
          
          // Converter os passos serializáveis de volta para FunnelStep com icons
          const loadedSteps: FunnelStep[] = template.steps.map((step: SerializableFunnelStep) => {
            // Convertemos o tipo do ícone de string para componente React
            // Usa o ícone correto para cada tipo de passo e iconType
            const stepIcon = getIconForStepType(step.type, step.iconType);
            
            console.log(`Carregando passo: ${step.name}, tipo: ${step.type}, iconType: ${step.iconType || 'não definido'}`);
            
            return {
              ...step,
              icon: stepIcon
            };
          });
          
          setSteps(loadedSteps);
          
          // Não limpar o sessionStorage até que o modelo seja salvo
          // para permitir identificar que está editando um modelo existente
          
          // Salvar no histórico
          saveToHistory(loadedSteps);
        } catch (error) {
          console.error("Erro ao carregar o modelo:", error);
          sessionStorage.removeItem('editingFunnelTemplate');
        }
      }
    };
    
    loadSavedTemplate();
  }, []);
  
  // Função auxiliar para obter o ícone correto para cada tipo de passo
  const getIconForStepType = (type: string, iconType?: string): React.ReactNode => {
    // Se o iconType é definido, tentar usar primeiro
    if (iconType) {
      // Mapeamento para ícones específicos por iconType
      const iconTypeMap: { [key: string]: React.ReactNode } = {
        'whatsapp': <Phone className="h-4 w-4" />,
        'tiktok': <Video className="h-4 w-4" />,
        'youtube': <Youtube className="h-4 w-4" />,
        'instagram': <Instagram className="h-4 w-4" />,
        'linkedin': <Linkedin className="h-4 w-4" />,
        'facebook': <Facebook className="h-4 w-4" />,
        'telegram': <Send className="h-4 w-4" />,
        'twitter': <Twitter className="h-4 w-4" />,
        'email': <Mail className="h-4 w-4" />,
        'site': <Globe className="h-4 w-4" />,
        'telefone': <Phone className="h-4 w-4" />,
        'formulario': <FileText className="h-4 w-4" />,
        'snapchat': <Camera className="h-4 w-4" />,
        'pinterest': <Grid3X3 className="h-4 w-4" />,
        'default': <FileText className="h-4 w-4" />
      };

      // Verificar correspondência exata
      const exactMatch = iconTypeMap[iconType.toLowerCase()];
      if (exactMatch) {
        return exactMatch;
      }

      // Verificar correspondências parciais
      const lowerIconType = iconType.toLowerCase();
      
      if (lowerIconType.includes('whatsapp')) return <Phone className="h-4 w-4" />
      if (lowerIconType.includes('tiktok')) return <Video className="h-4 w-4" />
      if (lowerIconType.includes('youtube')) return <Youtube className="h-4 w-4" />
      if (lowerIconType.includes('instagram')) return <Instagram className="h-4 w-4" />
      if (lowerIconType.includes('linkedin')) return <Linkedin className="h-4 w-4" />
      if (lowerIconType.includes('facebook')) return <Facebook className="h-4 w-4" />
      if (lowerIconType.includes('telegram')) return <Send className="h-4 w-4" />
      if (lowerIconType.includes('twitter')) return <Twitter className="h-4 w-4" />
      if (lowerIconType.includes('email') || lowerIconType.includes('mail')) return <Mail className="h-4 w-4" />
      if (lowerIconType.includes('site') || lowerIconType.includes('web')) return <Globe className="h-4 w-4" />
      if (lowerIconType.includes('telefone') || lowerIconType.includes('phone')) return <Phone className="h-4 w-4" />
      if (lowerIconType.includes('formulario') || lowerIconType.includes('form')) return <FileText className="h-4 w-4" />
      if (lowerIconType.includes('snapchat')) return <Camera className="h-4 w-4" />
      if (lowerIconType.includes('pinterest')) return <Grid3X3 className="h-4 w-4" />
      
      // Como último recurso, verificar o tipo
      switch (type.toLowerCase()) {
        case 'whatsapp':
          return <Phone className="h-4 w-4" />;
        case 'link':
        case 'site':
        case 'web':
          return <Globe className="h-4 w-4" />;
        case 'email':
        case 'mail':
          return <Mail className="h-4 w-4" />;
        case 'telefone':
        case 'phone':
          return <Phone className="h-4 w-4" />;
        case 'formulario':
        case 'form':
          return <FileText className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    }

    // Fallback baseado no tipo se o iconType não estiver definido ou não for reconhecido
    switch (type.toLowerCase()) {
      case 'whatsapp':
        return <Phone className="h-4 w-4" />;
      case 'link':
      case 'site':
      case 'web':
        return <Globe className="h-4 w-4" />;
      case 'email':
      case 'mail':
        return <Mail className="h-4 w-4" />;
      case 'telefone':
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'formulario':
      case 'form':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Efeito para gerenciar atalhos de teclado
  useEffect(() => {
    // Função para lidar com atalhos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar se estamos editando texto em algum campo
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        // Não ativar atalhos quando estiver digitando em campos de texto
        return;
      }
      
      // Tecla de espaço ativa temporariamente o modo mão
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsHandToolActive(true);
      }
      
      // Apagar elementos selecionados com Delete ou Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSteps.length > 0) {
        e.preventDefault();
        removeSelected();
      }
      
      // Desfazer com Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Refazer com Ctrl+Shift+Z ou Ctrl+Y
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
          (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      }
      
      // Atalhos adicionais...
    };
    
    // Função para lidar com a liberação de teclas
    const handleKeyUp = (e: KeyboardEvent) => {
      // Não interferir com campos de texto
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      
      // Desativar o modo mão quando a tecla de espaço é liberada
      if (e.code === 'Space') {
        setIsHandToolActive(false);
      }
    };
    
    // Adicionar os event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Limpar os event listeners ao desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedSteps, removeSelected, undo, redo, setIsHandToolActive]);
  
  // Adicionar o seguinte código antes do return final para habilitar a detecção de edição de texto
  useEffect(() => {
    // Função para evitar atalhos de teclado em campos de texto
    const handleSpaceKey = (e: KeyboardEvent) => {
      // Verificar se estamos digitando em um campo de texto ou área editável
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        // Se estiver digitando, não ativar a ferramenta de mão
        return;
      }
      
      // Se a tecla for espaço, ativar temporariamente o modo mão
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsHandToolActive(true);
      }
    };
    
    // Função para desativar o modo mão quando a tecla de espaço é liberada
    const handleSpaceKeyUp = (e: KeyboardEvent) => {
      // Ignorar se estivermos em um campo de texto
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      
      // Desativar o modo mão quando a tecla é liberada
      if (e.code === 'Space') {
        setIsHandToolActive(false);
      }
    };
    
    // Registrar os manipuladores de eventos
    document.addEventListener('keydown', handleSpaceKey);
    document.addEventListener('keyup', handleSpaceKeyUp);
    
    // Limpar os listeners quando o componente desmontar
    return () => {
      document.removeEventListener('keydown', handleSpaceKey);
      document.removeEventListener('keyup', handleSpaceKeyUp);
    };
  }, [setIsHandToolActive]);
  
  return (
    <div className="fixed inset-0 md:left-[256px] left-0 top-[60px] overflow-hidden flex flex-col h-[calc(100vh-60px)] bg-white md:w-[calc(100vw-256px)] w-full transition-all duration-300">
      {/* Barra superior - Navbar do editor */}
      <div className="h-14 bg-white border-b py-1.5 flex items-center justify-between px-4 w-full">
        <div className="flex items-center space-x-4">
          <Link 
            to={backUrl}
            className="text-gray-700 hover:text-emerald-600 flex items-center"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 font-medium">Voltar</span>
          </Link>
          
          <div className="border-l border-gray-200 h-6 mx-2" />
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={funnelName}
              onChange={e => setFunnelName(e.target.value)}
              className="text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 px-2 py-1 rounded"
              placeholder="Nome do funil"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded border border-gray-200 hover:border-emerald-500 transition-colors"
            onClick={() => setShowSaveTemplateModal(true)}
          >
            <BookmarkPlus size={18} />
            <span>Salvar como modelo</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded border border-gray-200 hover:border-emerald-500 transition-colors"
            onClick={() => setShowExportModal(true)}
          >
            <Download size={18} />
            <span>Exportar</span>
          </button>
          
          <button className="bg-emerald-500 text-white px-4 py-1.5 rounded flex items-center space-x-1 hover:bg-emerald-600 transition-colors">
            <Save size={18} />
            <span>Salvar</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Barra de ferramentas lateral esquerda do editor */}
        <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2 flex-shrink-0 z-20">
          {!showPanel && (
            <button 
              className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 mb-2"
              onClick={() => setShowPanel(true)}
              title="Mostrar Painel de Elementos"
            >
              <Layout size={20} />
            </button>
          )}
          <button 
            className={`p-2 rounded-lg ${activeTool === 'pointer' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
            onClick={() => {
              // Garantir que o modo mão seja desativado
              setIsHandToolActive(false);
              
              // Limpar estados de arrasto
              cleanupDragStates();
              
              // Definir a ferramenta e garantir que o cursor esteja correto
              setActiveTool('pointer');
              if (editorRef.current) {
                editorRef.current.style.cursor = '';
              }
            }}
            title="Selecionar"
          >
            <MousePointer size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTool === 'move' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
            onClick={() => {
              // Garantir que o modo mão seja desativado
              setIsHandToolActive(false);
              
              // Limpar estados de arrasto
              cleanupDragStates();
              
              // Definir a ferramenta e garantir que o cursor esteja correto
              setActiveTool('move');
              if (editorRef.current) {
                editorRef.current.style.cursor = '';
              }
            }}
            title="Mover"
          >
            <Move size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTool === 'hand' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
            onClick={() => {
              cleanupDragStates();
              
              if (activeTool === 'hand') {
                // Desativando o modo mão
                setActiveTool(previousActiveTool.current || 'pointer');
                setIsHandToolActive(false);
                if (editorRef.current) {
                  editorRef.current.style.cursor = '';
                }
              } else {
                // Ativando o modo mão
                previousActiveTool.current = activeTool;
                setActiveTool('hand');
                setIsHandToolActive(true);
                if (editorRef.current) {
                  editorRef.current.style.cursor = 'grab';
                }
              }
            }}
            title="Navegação (Mão) - Pressione ESPAÇO"
          >
            <Hand size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTool === 'connect' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
            onClick={() => {
              // Garantir que o modo mão seja desativado
              setIsHandToolActive(false);
              
              // Limpar estados de arrasto
              cleanupDragStates();
              
              // Definir a ferramenta e garantir que o cursor esteja correto
              setActiveTool('connect');
              if (editorRef.current) {
                editorRef.current.style.cursor = '';
              }
            }}
            title="Conectar"
          >
            <GitFork size={20} />
          </button>
          
          <div className="w-8 border-t border-gray-200 my-2"></div>
          
          <button 
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => alignElements('left')}
            title="Alinhar à Esquerda"
            disabled={selectedSteps.length < 2}
          >
            <AlignLeft size={20} />
          </button>
          <button 
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => alignElements('center')}
            title="Centralizar Horizontalmente"
            disabled={selectedSteps.length < 2}
          >
            <AlignCenter size={20} />
          </button>
          <button 
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => alignElements('right')}
            title="Alinhar à Direita"
            disabled={selectedSteps.length < 2}
          >
            <AlignRight size={20} />
          </button>
          
          <div className="w-8 border-t border-gray-200 my-2"></div>
          
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => duplicateSelected()}
            title="Duplicar Selecionados"
            disabled={selectedSteps.length === 0}
          >
            <Copy size={20} />
          </button>
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => removeSelected()}
            title="Remover Selecionados"
            disabled={selectedSteps.length === 0}
          >
            <Trash2 size={20} />
          </button>
          
          <div className="flex-1"></div>
          
          <button
            className={`p-2 rounded-lg ${showLabels ? 'text-emerald-600' : 'text-gray-600'} hover:bg-emerald-50 hover:text-emerald-600`}
            onClick={() => setShowLabels(!showLabels)}
            title="Mostrar/Ocultar Rótulos"
          >
            <Eye size={20} />
          </button>
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            title="Configurações"
          >
            <Settings size={20} />
          </button>
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            title="Ajuda"
          >
            <HelpCircle size={20} />
          </button>
        </div>
        
        {/* Painel lateral de elementos do editor */}
        <div className={`bg-white p-4 h-full overflow-y-auto flex flex-col gap-4 border-r border-gray-200 flex-shrink-0 z-20 transition-all duration-300 
          ${showPanel ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
          ${showPanel ? 'sm:w-72' : 'sm:w-0'} 
          ${showPanel ? 'md:w-72' : 'md:w-0'}
        `}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Layout size={18} /> Elementos
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowPanel(false)}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* Categorias de elementos */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {availableElements.map((category) => (
              <div key={category.category} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  className={`w-full p-3 font-medium text-left text-gray-700 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                    expandedCategories.includes(category.category) ? "border-b border-gray-200" : ""
                  }`}
                  onClick={() => toggleCategory(category.category)}
                >
                  {category.category}
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      expandedCategories.includes(category.category) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedCategories.includes(category.category) && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.items.map((item) => renderPanelItem(item))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Área do editor - atualizada com eventos de clique e zoom */}
        <div 
          ref={editorRef}
          className="flex-1 overflow-auto relative bg-white z-10"
          style={{ 
            height: '100%',
            width: '100%',
            minWidth: 0,
            flexGrow: 1,
            cursor: (isHandToolActive || activeTool === 'hand') ? 'grab' : ''
          }}
        >
          {/* Área de conteúdo interno - área onde os elementos são posicionados */}
          <div 
            ref={contentAreaRef}
            className="absolute grid bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:20px_20px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleEditorClick}
            onMouseDown={handleHandToolMouseDown}
            onMouseMove={handleHandToolMouseMove}
            onMouseUp={handleHandToolMouseUp}
            onMouseLeave={handleHandToolMouseLeave}
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: '10000px',
              height: '10000px',
              left: '0',
              top: '0'
              // Removido o cursor daqui para evitar conflitos
            }}
          >
            {/* Controles de zoom flutuantes para mobile */}
            <div className="sm:hidden fixed bottom-6 right-6 flex flex-col space-y-2 z-50">
              <button 
                onClick={() => handleZoom(zoom + 10)}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                disabled={zoom >= 200}
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={() => handleZoom(zoom - 10)}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                disabled={zoom <= 50}
              >
                <ZoomOut size={20} />
              </button>
            </div>
            
            {/* Dica de navegação com mão */}
            {(isHandToolActive || activeTool === 'hand') && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 shadow-lg rounded-lg px-4 py-2 z-50 flex items-center space-x-2 border border-emerald-200">
                <Hand size={18} className="text-emerald-600" />
                <span className="text-sm text-gray-700">Clique e arraste para navegar pelo funil</span>
              </div>
            )}
            
            {/* Linhas de conexão - Atualizadas para curvas bezier mais suaves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {lines.map((line, index) => {
                // Criar um ID único para a linha
                const lineId = `${line.from}-${line.to}`;
                
                // Verificar se a linha está sendo hover
                const isHovered = hoveredConnection === lineId;
                
                return (
                  <g key={`line-${index}`}>
                    {/* Curva principal */}
                    <path
                      d={`M ${line.points[0].x} ${line.points[0].y} C ${line.points[1].x} ${line.points[1].y}, ${line.points[2].x} ${line.points[2].y}, ${line.points[3].x} ${line.points[3].y}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      className="transition-all duration-200"
                      onMouseEnter={() => setHoveredConnection(lineId)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    />
                    
                    {/* Ponto central com X - só aparece no hover */}
                    {isHovered && (
                      <g
                        transform={`translate(${(line.points[1].x + line.points[2].x) / 2}, ${(line.points[1].y + line.points[2].y) / 2})`}
                        className="cursor-pointer"
                        onClick={() => removeConnection(line.from, line.to)}
                      >
                        <circle r="10" fill="white" stroke="#10b981" strokeWidth="2" />
                        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#10b981" strokeWidth="2" />
                        <line x1="5" y1="-5" x2="-5" y2="5" stroke="#10b981" strokeWidth="2" />
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* Linha sendo desenhada durante a criação de conexão */}
              {connecting && (
                <line
                  x1={(steps.find(s => s.id === connecting)?.position?.x ?? 0) + 50}
                  y1={(steps.find(s => s.id === connecting)?.position?.y ?? 0) + 40}
                  x2="0"
                  y2="0"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="temp-line"
                  style={{ display: 'none' }}
                />
              )}
            </svg>
            
            {/* Elementos do funil */}
            {steps.map((step) => {
              // Obter o esquema de cores correto (usar default se não especificado)
              const colorScheme = step.colorScheme ? colorSchemes[step.colorScheme as keyof typeof colorSchemes] : colorSchemes.default;
              
              // Determinar a classe específica com base no tipo
              let elementClasses = "w-24";
              let elementStyle: React.CSSProperties = { 
                position: 'absolute',
                left: `${step.position.x}px`,
                top: `${step.position.y}px`,
                touchAction: 'none',
                zIndex: selectedSteps.includes(step.id) ? 20 : 10,
                transform: `scale(${(step as any).size || 1})`,
                transformOrigin: 'top left',
              };
              
              if (step.type === "web") {
                // Formato de página para elementos web
                elementClasses = "w-20 h-28";
              } else if (step.type === "social") {
                // Formato quadrado para redes sociais
                elementClasses = "w-20 h-20";
              } else if (step.type === "marketing") {
                // Formato horizontal para marketing
                elementClasses = "w-28 h-20";
              } else {
                // Formato padrão
                elementClasses = "w-24";
              }
              
              return (
                <div
                  key={step.id}
                  data-id={step.id}
                  style={elementStyle}
                  className={`${elementClasses} funnel-element
                    ${(activeTool === 'move' || activeTool === 'pointer') ? 'cursor-move' : 
                      activeTool === 'connect' ? 'cursor-pointer' : 'cursor-default'} 
                    select-none transition-shadow
                    ${selectedSteps.includes(step.id) ? 'selected-element' : ''}
                  `}
                  onClick={(e) => handleElementClick(e, step.id)}
                  onMouseDown={(e) => handleMouseDown(e, step.id)}
                  onMouseEnter={() => setHoveredElementSafe(step.id)}
                  onMouseLeave={() => setHoveredElementSafe(null)}
                >
                  {/* Botão para remover - movido para fora */}
                  {(activeTool === 'move' || activeTool === 'pointer') && (hoveredElement === step.id) && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full shadow z-40">
                      <button 
                        className="text-gray-500 hover:text-red-500 remove-btn"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          removeElement(step.id);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  {/* Botão de seleção de cor - apenas para elementos não-web */}
                  {(activeTool === 'move' || activeTool === 'pointer') && (hoveredElement === step.id) && (step.type !== "web") && (
                    <div 
                      className="absolute -top-2 -left-2 bg-white rounded-full shadow z-40 p-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingColor(step.id);
                      }}
                    >
                      <div className={`w-3 h-3 rounded-full ${colorScheme.iconBgColor}`} />
                    </div>
                  )}
                  
                  {/* Controle de redimensionamento - movido para fora */}
                  {(activeTool === 'move' || activeTool === 'pointer') && (hoveredElement === step.id) && (
                    <div 
                      className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center cursor-se-resize z-40 resize-handle hover:bg-emerald-50 hover:border-emerald-300 transition-colors duration-150"
                      onMouseDown={(e) => handleResizeStart(e, step.id)}
                    >
                      <Maximize size={10} className="text-emerald-600" />
                    </div>
                  )}

                  <div className={`${colorScheme.bgColor} shadow-md rounded-lg flex flex-col items-center relative border-2 
                    ${selectedSteps.includes(step.id) ? `ring-2 ${colorScheme.ringColor} border-${colorScheme.ringColor.split('-').pop()}` : colorScheme.borderColor}
                    ${connecting === step.id ? `border-${colorScheme.ringColor.split('-').pop()} ring-2 ${colorScheme.ringColor}` : 
                      connecting && activeTool === 'connect' ? `hover:border-${colorScheme.ringColor.split('-').pop()}-300 hover:ring-2 hover:ring-${colorScheme.ringColor.split('-').pop()}-300 transition-all` : 
                      colorScheme.borderColor}
                    h-full w-full
                    ${step.type === "web" ? "overflow-hidden p-0" : "p-2"}
                  `}>
                    
                    {/* Modal de seleção de cores */}
                    {editingColor === step.id && (
                      <div className={`absolute ${step.type === "web" ? "-left-36 -top-16" : "-left-28 -top-12"} bg-white shadow-lg rounded-lg p-2 z-50 w-48`}>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {Object.entries(colorSchemes).map(([scheme, colors]) => (
                            <div 
                              key={scheme}
                              className={`w-6 h-6 rounded-full ${colors.iconBgColor} cursor-pointer hover:ring-2 ${colors.ringColor} transition-all duration-150`}
                              onClick={() => selectElementColor(step.id, scheme)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {step.type === "web" ? (
                      // Layout específico para elementos web no editor
                      <>
                        {/* Barra de navegação estilizada */}
                        <div className="w-full h-6 bg-emerald-500 flex items-center justify-between px-1.5">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></div>
                          </div>
                          <div className="text-white text-[8px] font-medium truncate">
                            {step.type === "web" && step.name === "Landing Page" ? "Lead" :
                             step.type === "web" && step.name === "Página de Vendas" ? "Venda" :
                             step.type === "web" && step.name === "Checkout" ? "Pagamento" :
                             step.type === "web" && step.name === "Página de Obrigado" ? "Sucesso" :
                             step.type === "web" && step.name === "Upsell" ? "Oferta" :
                             step.type === "web" && step.name === "Webinar" ? "Webinar" :
                             step.type === "web" && step.name === "Post de Blog" ? "Blog" :
                             step.type === "web" && step.name === "Página de Avaliações" ? "Reviews" :
                             step.type === "web" && step.name === "Comparação de Produtos" ? "Comparativo" :
                             step.type === "web" && step.name === "Portfólio" ? "Portfólio" :
                             "Página"}
                          </div>
                        </div>
                        
                        <div className="bg-white flex-col items-center justify-between p-2 h-full flex">
                          {/* Elemento de conteúdo estilizado como uma página web */}
                          <div className="w-full h-3 bg-emerald-100 rounded mb-1"></div>
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-full text-emerald-500">
                              {step.icon}
                            </div>
                          </div>
                          <div className="w-3/4 h-2 bg-emerald-100 rounded mb-1 mx-auto"></div>
                          <div className="w-2/3 h-2 bg-emerald-100 rounded mx-auto"></div>
                          
                          {/* Botão estilizado */}
                          <div className="mt-1.5 w-full mx-auto">
                            <div className="bg-emerald-500 text-white text-[9px] py-1 px-1 rounded-md font-medium text-center">
                              {step.type === "web" && step.name === "Landing Page" ? "CAPTURAR" :
                               step.type === "web" && step.name === "Página de Vendas" ? "COMPRAR" :
                               step.type === "web" && step.name === "Checkout" ? "CHECKOUT" :
                               step.type === "web" && step.name === "Página de Obrigado" ? "OBRIGADO" :
                               step.type === "web" && step.name === "Upsell" ? "UPSELL" :
                               step.type === "web" && step.name === "Webinar" ? "ASSISTIR" :
                               step.type === "web" && step.name === "Post de Blog" ? "LER MAIS" :
                               step.type === "web" && step.name === "Página de Avaliações" ? "REVIEWS" :
                               step.type === "web" && step.name === "Comparação de Produtos" ? "COMPARAR" :
                               step.type === "web" && step.name === "Portfólio" ? "PORTFÓLIO" :
                               "ACESSAR"}
                            </div>
                          </div>
                          
                          {showLabels && (
                            <span className="text-xs font-semibold text-gray-800 text-center truncate w-full mt-1">
                              {step.label || step.name}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`w-10 h-10 flex items-center justify-center ${colorScheme.iconBgColor} rounded-full mb-1 ${colorScheme.iconColor}`}>
                          {step.icon}
                        </div>
                        {showLabels && (
                          <span className="text-xs font-medium text-gray-700 text-center truncate w-full">
                            {step.label || step.name}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Pontos de conexão */}
                    {activeTool === 'connect' && (
                      <>
                        {/* Obter as dimensões corretas baseadas no tipo */}
                        {(() => {
                          let elementWidth = 96; // w-24 default
                          let elementHeight = 80; // altura aproximada default
                          
                          if (step.type === "web") {
                            elementWidth = 80; // w-20
                            elementHeight = 112; // h-28
                          } else if (step.type === "social") {
                            elementWidth = 80; // w-20
                            elementHeight = 80; // h-20
                          } else if (step.type === "marketing") {
                            elementWidth = 112; // w-28
                            elementHeight = 80; // h-20
                          }
                          
                          // Aplicar escala
                          const scale = (step as any).size || 1;
                          elementWidth *= scale;
                          elementHeight *= scale;
                          
                          // Calcular pontos de conexão posicionados fora completamente
                          // Basta conferir se o tipo é "web" para usar posições especiais
                          const isWeb = step.type === "web";
                          
                          return (
                            <div className="absolute inset-0 z-0">
                              {/* Pontos de conexão posicionados diferentemente para páginas web */}
                              <div className="relative w-full h-full">
                                {/* Ponto de conexão do topo */}
                                <div className={`absolute left-1/2 ${isWeb ? '-top-8' : '-top-3'} transform -translate-x-1/2 z-50`}>
                                  <ConnectionPoint
                                    position="top"
                                    isActive={connecting === step.id && activeFromPoint === 'top'}
                                    stepId={step.id}
                                    elementWidth={elementWidth}
                                    elementHeight={elementHeight}
                                    onClickHandler={(e) => {
                                      e.stopPropagation();
                                      if (connecting === null) {
                                        setConnecting(step.id);
                                        setActiveFromPoint('top');
                                      } else if (connecting !== step.id) {
                                        createConnection(step.id, activeFromPoint || 'bottom', 'top');
                                      } else {
                                        setConnecting(null);
                                        setActiveFromPoint(null);
                                      }
                                    }}
                                    onMouseEnter={() => setHoveredPointSafe('top')}
                                    onMouseLeave={() => setHoveredPointSafe(null)}
                                  />
                                </div>
                                
                                {/* Ponto de conexão da direita */}
                                <div className={`absolute top-1/2 ${isWeb ? 'right-[-24px]' : '-right-3'} transform -translate-y-1/2 z-50`}>
                                  <ConnectionPoint
                                    position="right"
                                    isActive={connecting === step.id && activeFromPoint === 'right'}
                                    stepId={step.id}
                                    elementWidth={elementWidth}
                                    elementHeight={elementHeight}
                                    onClickHandler={(e) => {
                                      e.stopPropagation();
                                      if (connecting === null) {
                                        setConnecting(step.id);
                                        setActiveFromPoint('right');
                                      } else if (connecting !== step.id) {
                                        createConnection(step.id, activeFromPoint || 'bottom', 'right');
                                      } else {
                                        setConnecting(null);
                                        setActiveFromPoint(null);
                                      }
                                    }}
                                    onMouseEnter={() => setHoveredPointSafe('right')}
                                    onMouseLeave={() => setHoveredPointSafe(null)}
                                  />
                                </div>
                                
                                {/* Ponto de conexão da parte inferior */}
                                <div className={`absolute left-1/2 ${isWeb ? '-bottom-8' : '-bottom-3'} transform -translate-x-1/2 z-50`}>
                                  <ConnectionPoint
                                    position="bottom"
                                    isActive={connecting === step.id && activeFromPoint === 'bottom'}
                                    stepId={step.id}
                                    elementWidth={elementWidth}
                                    elementHeight={elementHeight}
                                    onClickHandler={(e) => {
                                      e.stopPropagation();
                                      if (connecting === null) {
                                        setConnecting(step.id);
                                        setActiveFromPoint('bottom');
                                      } else if (connecting !== step.id) {
                                        createConnection(step.id, activeFromPoint || 'bottom', 'bottom');
                                      } else {
                                        setConnecting(null);
                                        setActiveFromPoint(null);
                                      }
                                    }}
                                    onMouseEnter={() => setHoveredPointSafe('bottom')}
                                    onMouseLeave={() => setHoveredPointSafe(null)}
                                  />
                                </div>
                                
                                {/* Ponto de conexão da esquerda */}
                                <div className={`absolute top-1/2 ${isWeb ? 'left-[-24px]' : '-left-3'} transform -translate-y-1/2 z-50`}>
                                  <ConnectionPoint
                                    position="left"
                                    isActive={connecting === step.id && activeFromPoint === 'left'}
                                    stepId={step.id}
                                    elementWidth={elementWidth}
                                    elementHeight={elementHeight}
                                    onClickHandler={(e) => {
                                      e.stopPropagation();
                                      if (connecting === null) {
                                        setConnecting(step.id);
                                        setActiveFromPoint('left');
                                      } else if (connecting !== step.id) {
                                        createConnection(step.id, activeFromPoint || 'bottom', 'left');
                                      } else {
                                        setConnecting(null);
                                        setActiveFromPoint(null);
                                      }
                                    }}
                                    onMouseEnter={() => setHoveredPointSafe('left')}
                                    onMouseLeave={() => setHoveredPointSafe(null)}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Exportar Funil</h3>
              <p className="text-sm text-gray-500">Escolha o formato de exportação desejado</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${exportFormat === 'png' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                  onClick={() => setExportFormat('png')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600">
                      <Image size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Imagem (PNG)</h4>
                      <p className="text-xs text-gray-500">Exporte seu funil como uma imagem para compartilhar</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${exportFormat === 'json' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                  onClick={() => setExportFormat('json')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600">
                      <Code size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Dados (JSON)</h4>
                      <p className="text-xs text-gray-500">Exporte os dados do funil para importar depois</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={exportFormat === 'png' ? exportAsImage : exportAsJSON}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Edição de Elemento */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-auto max-h-[90vh]">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Editar Elemento</h3>
              <p className="text-sm text-gray-500">Personalize as propriedades deste elemento</p>
            </div>
            
            <div className="p-4">
              {steps.find(s => s.id === editingStep) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input 
                      type="text"
                      value={steps.find(s => s.id === editingStep)?.name || ''}
                      onChange={e => updateStep(editingStep, { name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rótulo Personalizado</label>
                    <input 
                      type="text"
                      value={steps.find(s => s.id === editingStep)?.label || ''}
                      onChange={e => updateStep(editingStep, { label: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Opcional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea 
                      value={steps.find(s => s.id === editingStep)?.notes || ''}
                      onChange={e => updateStep(editingStep, { notes: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Adicione observações ou detalhes"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Estatísticas</label>
                      <span className="text-xs text-gray-500">Opcional</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Visualizações</label>
                        <input 
                          type="number"
                          value={steps.find(s => s.id === editingStep)?.stats?.views || ''}
                          onChange={e => {
                            const step = steps.find(s => s.id === editingStep);
                            updateStep(editingStep, { 
                              stats: { 
                                ...(step?.stats || {}), 
                                views: parseInt(e.target.value) || 0 
                              } 
                            });
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Conversões</label>
                        <input 
                          type="number"
                          value={steps.find(s => s.id === editingStep)?.stats?.conversions || ''}
                          onChange={e => {
                            const step = steps.find(s => s.id === editingStep);
                            updateStep(editingStep, { 
                              stats: { 
                                ...(step?.stats || {}), 
                                conversions: parseInt(e.target.value) || 0 
                              } 
                            });
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Taxa (%)</label>
                        <input 
                          type="number"
                          value={steps.find(s => s.id === editingStep)?.stats?.rate || ''}
                          onChange={e => {
                            const step = steps.find(s => s.id === editingStep);
                            updateStep(editingStep, { 
                              stats: { 
                                ...(step?.stats || {}), 
                                rate: parseFloat(e.target.value) || 0 
                              } 
                            });
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setEditingStep(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setEditingStep(null)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tutorial para novos usuários */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Bem-vindo ao Editor Funnel Builder
                <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-medium align-middle">BETA</span>
              </h3>
              <p className="text-sm text-gray-500">Aprenda a usar o editor de funis em poucos passos</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mt-0.5">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Adicione elementos</h4>
                    <p className="text-sm text-gray-600">Arraste elementos do painel lateral e solte-os no quadro para criar seu funil.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mt-0.5">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Conecte os passos</h4>
                    <p className="text-sm text-gray-600">Use a ferramenta de conexão para ligar elementos e criar o fluxo do seu funil.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mt-0.5">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Organize seu funil</h4>
                    <p className="text-sm text-gray-600">Selecione vários elementos (com Shift) para alinhá-los ou movê-los em grupo.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mt-0.5">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Salve e compartilhe</h4>
                    <p className="text-sm text-gray-600">Salve seu trabalho e exporte-o como imagem ou arquivo para compartilhar.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={closeTutorial}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
              >
                Entendi, vamos começar!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para salvar como modelo */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-5 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Salvar como modelo</h3>
                <button 
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {saveSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-emerald-100 text-emerald-600 rounded-full p-3 mb-4">
                    <Check size={36} />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Modelo salvo com sucesso!</h4>
                  <p className="text-gray-600 text-center">
                    Seu modelo de funil foi salvo e agora está disponível na sua lista de modelos personalizados.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); saveAsTemplate(); }}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Título do modelo *
                    </label>
                    <input
                      type="text"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Funil de vendas para curso online"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                      placeholder="Descreva para que serve este modelo de funil..."
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tipo de funil
                    </label>
                    <select
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="sales">Vendas</option>
                      <option value="leads">Captura de Leads</option>
                      <option value="webinar">Webinar</option>
                      <option value="launch">Lançamento</option>
                      <option value="membership">Membership</option>
                      <option value="saas">SaaS</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="survey">Pesquisa/Quiz</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => setShowSaveTemplateModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      Salvar modelo
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FunnelFyEditor; 