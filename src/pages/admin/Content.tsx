import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  BookOpen, 
  Edit, 
  Trash, 
  Plus, 
  ArrowLeft,
  Save,
  Eye,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Calendar,
  Info,
  Sparkles,
  Zap,
  LineChart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { aiService } from '../../services/aiService';

// Tipos de conteúdo que podem ser gerenciados
interface RelevantContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  external_url?: string;
  status: 'published' | 'draft' | 'scheduled' | 'pending';
  created_at: string;
  updated_at: string;
  author: string;
  tags?: string[];
  view_count: number;
  like_count: number;
}

// Definir a interface de props para o modal
interface AiModalProps {
  show: boolean;
  topic: string;
  additionalInfo: string;
  customAuthor: string;
  tone: string;
  targetAudience: string;
  contentLength: string;
  includeHeaders: boolean;
  includeFAQs: boolean;
  isGenerating: boolean;
  generationProgress: string;
  onClose: () => void;
  onGenerate: () => void;
  onTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInfoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAuthorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToneChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTargetAudienceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentLengthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onIncludeHeadersChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncludeFAQsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Definir a interface de props para o modal de impulso
interface BoostModalProps {
  show: boolean;
  title: string;
  boostType: 'depth' | 'seo' | 'engagement' | 'examples' | 'all';
  additionalInstructions: string;
  isBoosting: boolean;
  boostProgress: string;
  onClose: () => void;
  onBoost: () => void;
  onBoostTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Criar um componente separado para o modal
const AiModal = memo(({
  show,
  topic,
  additionalInfo,
  customAuthor,
  tone,
  targetAudience,
  contentLength,
  includeHeaders,
  includeFAQs,
  isGenerating,
  generationProgress,
  onClose,
  onGenerate,
  onTopicChange,
  onInfoChange,
  onAuthorChange,
  onToneChange,
  onTargetAudienceChange,
  onContentLengthChange,
  onIncludeHeadersChange,
  onIncludeFAQsChange
}: AiModalProps) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-emerald-500" />
          Gerar Conteúdo com IA Deepseek V3
        </h3>
        
        <p className="text-gray-600 mb-6">
          Nossa API de IA Deepseek V3 gerará um conteúdo de alta qualidade baseado nas suas especificações.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tópico Principal *
            </label>
            <input
              type="text"
              value={topic}
              onChange={onTopicChange}
              placeholder="Ex: Estratégias de Marketing de Conteúdo"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              O assunto principal que será abordado no conteúdo
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autor do Conteúdo
            </label>
            <input
              type="text"
              value={customAuthor}
              onChange={onAuthorChange}
              placeholder="Nome do autor ou serviço de IA"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              O padrão é "AI Deepseek V3", mas você pode personalizá-lo
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tom de Voz
            </label>
            <select
              value={tone}
              onChange={onToneChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="profissional">Profissional</option>
              <option value="conversacional">Conversacional</option>
              <option value="informativo">Informativo</option>
              <option value="persuasivo">Persuasivo</option>
              <option value="educativo">Educativo</option>
              <option value="inspirador">Inspirador</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Define o estilo de escrita do conteúdo
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Público-Alvo
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={onTargetAudienceChange}
              placeholder="Ex: Profissionais de marketing, iniciantes em e-commerce"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Para quem o conteúdo será direcionado
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extensão do Conteúdo
            </label>
            <select
              value={contentLength}
              onChange={onContentLengthChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="curto">Curto (~500 palavras)</option>
              <option value="médio">Médio (~1000 palavras)</option>
              <option value="longo">Longo (~1500 palavras)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Determina o tamanho aproximado do conteúdo
            </p>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="includeHeaders"
                checked={includeHeaders}
                onChange={onIncludeHeadersChange}
                className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="includeHeaders" className="text-sm font-medium text-gray-700">
                Incluir Títulos e Subtítulos
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeFAQs"
                checked={includeFAQs}
                onChange={onIncludeFAQsChange}
                className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="includeFAQs" className="text-sm font-medium text-gray-700">
                Incluir Seção de Perguntas Frequentes (FAQ)
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informações Adicionais
          </label>
          <textarea
            value={additionalInfo}
            onChange={onInfoChange}
            placeholder="Detalhes específicos, ângulo desejado, pontos importantes a incluir, etc."
            className="w-full p-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Forneça contexto adicional para um conteúdo mais personalizado
          </p>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isGenerating}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !topic.trim()}
            className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 ${
              isGenerating || !topic.trim() 
                ? 'bg-emerald-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gerando{generationProgress}</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                <span>Gerar Conteúdo</span>
              </>
            )}
          </button>
        </div>

        {isGenerating && generationProgress && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            <p className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Gerando conteúdo: {generationProgress}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
});

// Criar um componente separado para o modal de impulso
const BoostModal = memo(({
  show,
  title,
  boostType,
  additionalInstructions,
  isBoosting,
  boostProgress,
  onClose,
  onBoost,
  onBoostTypeChange,
  onInstructionsChange
}: BoostModalProps) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-amber-500" />
          Impulsionar Conteúdo com IA
        </h3>
        
        <p className="text-gray-600 mb-6">
          Nossa IA Deepseek V3 irá aprimorar e expandir seu conteúdo sobre <span className="font-semibold">"{title}"</span>, tornando-o mais completo e detalhado.
        </p>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Impulso
            </label>
            <select
              value={boostType}
              onChange={onBoostTypeChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">Melhoria Completa (Tudo)</option>
              <option value="depth">Profundidade e Detalhamento</option>
              <option value="seo">Otimização para SEO</option>
              <option value="engagement">Engajamento e Persuasão</option>
              <option value="examples">Exemplos Práticos e Casos</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Selecione o foco principal do impulso para seu conteúdo
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruções Adicionais (opcional)
            </label>
            <textarea
              value={additionalInstructions}
              onChange={onInstructionsChange}
              placeholder="Ex: Adicione mais dados sobre mercado brasileiro, foque em estratégias para pequenas empresas, etc."
              className="w-full p-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Forneça instruções específicas para direcionar a melhoria do conteúdo
            </p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mb-6">
          <div className="flex items-start">
            <LineChart className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">O que este recurso faz?</h4>
              <p className="text-xs text-amber-700 mt-1">
                O Impulso de Conteúdo analisa e melhora seu texto atual, adicionando mais detalhes, 
                exemplos, dados relevantes e otimizações sem alterar o conteúdo original. 
                O resultado final será um conteúdo mais rico e abrangente.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isBoosting}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onBoost}
            disabled={isBoosting}
            className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 ${
              isBoosting 
                ? 'bg-amber-400 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isBoosting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Impulsionando{boostProgress}</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Impulsionar Conteúdo</span>
              </>
            )}
          </button>
        </div>

        {isBoosting && boostProgress && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <p className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Melhorando conteúdo: {boostProgress}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
});

const AdminContent: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentItems, setContentItems] = useState<RelevantContent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<RelevantContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiAdditionalInfo, setAiAdditionalInfo] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiCustomAuthor, setAiCustomAuthor] = useState<string>('AI Deepseek V3');
  const [aiTone, setAiTone] = useState<string>('profissional');
  const [aiTargetAudience, setAiTargetAudience] = useState<string>('profissionais de marketing digital');
  const [aiContentLength, setAiContentLength] = useState<string>('médio');
  const [aiIncludeHeaders, setAiIncludeHeaders] = useState<boolean>(true);
  const [aiIncludeFAQs, setAiIncludeFAQs] = useState<boolean>(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostType, setBoostType] = useState<'depth' | 'seo' | 'engagement' | 'examples' | 'all'>('all');
  const [boostInstructions, setBoostInstructions] = useState('');
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [boostProgress, setBoostProgress] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // Carregar conteúdo
          loadContent();
        }
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('relevant_contents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar conteúdos:', error);
        throw error;
      }
      
      setContentItems(data || []);
    } catch (err) {
      console.error('Falha ao carregar conteúdos:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setContentItems([
        {
          id: '1',
          title: 'Introdução ao Marketing Digital',
          description: 'Um guia completo para iniciantes no marketing digital',
          content: 'Conteúdo detalhado sobre os fundamentos do marketing digital...',
          image_url: 'https://example.com/images/marketing-digital.jpg',
          status: 'published',
          created_at: '2023-03-10T14:30:00',
          updated_at: '2023-03-15T10:45:00',
          author: 'Admin',
          tags: ['marketing', 'digital', 'iniciantes'],
          view_count: 0,
          like_count: 0
        },
        {
          id: '2',
          title: 'Guia Completo de Copywriting',
          description: 'Aprenda técnicas avançadas de copywriting para aumentar suas vendas',
          content: 'Neste guia, vamos explorar as técnicas mais eficazes de copywriting...',
          image_url: 'https://example.com/images/copywriting.jpg',
          external_url: 'https://blog.digitfy.com/copywriting-guide',
          status: 'published',
          created_at: '2023-03-05T09:15:00',
          updated_at: '2023-03-20T16:20:00',
          author: 'Admin',
          tags: ['copywriting', 'vendas', 'conversão'],
          view_count: 0,
          like_count: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });
  
  const handleEditItem = (item: RelevantContent) => {
    setCurrentItem(item);
    setIsEditing(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('relevant_contents')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setContentItems(contentItems.filter(item => item.id !== id));
      } catch (err) {
        console.error('Erro ao excluir conteúdo:', err);
        alert('Não foi possível excluir o conteúdo. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newItem: RelevantContent = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Novo Conteúdo Relevante',
      description: 'Breve descrição do conteúdo',
      content: '',
      image_url: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Admin',
      tags: [],
      view_count: 0,
      like_count: 0
    };
    
    setCurrentItem(newItem);
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!currentItem) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validação básica
      if (!currentItem.title || !currentItem.description || !currentItem.content) {
        throw new Error('Por favor, preencha pelo menos título, descrição e conteúdo');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewItem = !contentItems.some(item => item.id === currentItem.id);
      
      // Atualizar o timestamp e adicionar o userId como created_by
      const updatedItem = {
        ...currentItem,
        updated_at: new Date().toISOString(),
        created_by: userId // Adicionar o ID do usuário atual
      };
      
      // Para debugging - mostrar os dados que serão enviados
      console.log('Dados a serem enviados:', updatedItem);
      
      let result;
      
      if (isNewItem) {
        // Inserir novo registro
        console.log('Criando novo conteúdo...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...itemWithoutId } = updatedItem;
        if (!id) {
          result = await supabase
            .from('relevant_contents')
            .insert([itemWithoutId]);
        } else {
          result = await supabase
            .from('relevant_contents')
            .insert([updatedItem]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando conteúdo existente...');
        result = await supabase
          .from('relevant_contents')
          .update(updatedItem)
          .eq('id', updatedItem.id);
      }
      
      if (result.error) {
        console.error('Erro retornado pelo Supabase:', result.error);
        throw new Error(`Erro do Supabase: ${result.error.message} (Código: ${result.error.code})`);
      }
      
      // Verificar se o resultado contém os dados esperados
      console.log('Resultado da operação:', result);
      
      // Atualiza a lista local
      if (isNewItem) {
        // Se for um novo item, recarregar a lista completa
        await loadContent();
      } else {
        setContentItems(contentItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
      }
      
      setSaveMessage('Conteúdo salvo com sucesso!');
      
      // Voltar para a listagem após 1 segundo
      setTimeout(() => {
        setIsEditing(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao salvar conteúdo:', err);
      
      // Adicionar mais informações de depuração
      if (err instanceof Error) {
        setSaveMessage(`Erro: ${err.message}`);
      } else if (typeof err === 'object' && err !== null) {
        setSaveMessage(`Ocorreu um erro ao salvar. Detalhes: ${JSON.stringify(err)}`);
      } else {
        setSaveMessage('Ocorreu um erro ao salvar. Verifique o console para mais detalhes.');
      }
      
      // Verificar conexão com Supabase
      try {
        const { error: pingError } = await supabase.from('relevant_contents').select('count(*)');
        if (pingError) {
          console.error('Erro ao conectar com o Supabase:', pingError);
          setSaveMessage(`Problemas na conexão com o banco de dados: ${pingError.message}`);
        }
      } catch (connErr) {
        console.error('Erro ao testar conexão:', connErr);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Funções de callback para o modal
  const handleCloseAiModal = React.useCallback(() => {
    setShowAiModal(false);
  }, []);

  const handleOpenAiModal = React.useCallback(() => {
    setAiTopic('');
    setAiAdditionalInfo('');
    setAiCustomAuthor('AI Deepseek V3');
    setAiTone('profissional');
    setAiTargetAudience('profissionais de marketing digital');
    setAiContentLength('médio');
    setAiIncludeHeaders(true);
    setAiIncludeFAQs(false);
    setShowAiModal(true);
  }, []);

  const handleAiTopicChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAiTopic(e.target.value);
  }, []);

  const handleAiInfoChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiAdditionalInfo(e.target.value);
  }, []);

  const handleAiAuthorChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAiCustomAuthor(e.target.value);
  }, []);

  const handleAiToneChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setAiTone(e.target.value);
  }, []);

  const handleAiTargetAudienceChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAiTargetAudience(e.target.value);
  }, []);

  const handleAiContentLengthChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setAiContentLength(e.target.value);
  }, []);

  const handleAiIncludeHeadersChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAiIncludeHeaders(e.target.checked);
  }, []);

  const handleAiIncludeFAQsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAiIncludeFAQs(e.target.checked);
  }, []);

  // Memorizar a função handleGenerateWithAI
  const handleGenerateWithAI = React.useCallback(async () => {
    if (!aiTopic.trim()) {
      alert('Por favor, informe um tópico para a geração do conteúdo');
      return;
    }

    setIsGeneratingAI(true);
    setGenerationProgress('');

    // Iniciar atualizações de progresso
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const dots = prev.match(/\./g)?.length || 0;
        return dots < 3 ? '.'.repeat(dots + 1) : '';
      });
    }, 500);

    try {
      // Mensagens informativas de progresso
      setTimeout(() => setGenerationProgress(' (preparando prompt)'), 2000);
      setTimeout(() => setGenerationProgress(' (processando informações)'), 5000);
      setTimeout(() => setGenerationProgress(' (gerando conteúdo)'), 10000);
      setTimeout(() => setGenerationProgress(' (formatando resultado)'), 20000);
      setTimeout(() => setGenerationProgress(' (finalizando)'), 40000);

      const generatedContent = await aiService.generateRelevantContent({
        topic: aiTopic,
        additionalInfo: aiAdditionalInfo,
        customAuthor: aiCustomAuthor,
        tone: aiTone,
        targetAudience: aiTargetAudience,
        contentLength: aiContentLength,
        includeHeaders: aiIncludeHeaders,
        includeFAQs: aiIncludeFAQs
      });
      
      // Adicionar imagem sugerida
      const imageUrl = aiService.getSuggestedImageUrl(generatedContent.title || '');
      
      // Se estiver na página de listagem, cria um novo item e vai para o modo de edição
      if (!isEditing) {
        const newItem: RelevantContent = {
          ...generatedContent,
          image_url: imageUrl,
          view_count: 0,
          like_count: 0
        };
        
        setCurrentItem(newItem);
        setIsEditing(true);
      } else {
        // Se já estiver no modo de edição, apenas atualiza o item atual
        setCurrentItem({
          ...currentItem as RelevantContent,
          ...generatedContent,
          image_url: imageUrl
        });
      }
      
      // Fechar o modal de IA
      setShowAiModal(false);
      
      // Mostrar mensagem de sucesso
      setSaveMessage('Conteúdo gerado com sucesso! Revise e salve para publicar.');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Erro ao gerar conteúdo com IA:', error);
      alert(`Erro ao gerar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress('');
      setIsGeneratingAI(false);
    }
  }, [aiTopic, aiAdditionalInfo, aiCustomAuthor, aiTone, aiTargetAudience, aiContentLength, aiIncludeHeaders, aiIncludeFAQs, isEditing, currentItem]);

  // Adicionar callbacks para o modal de impulso
  const handleBoostTypeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBoostType(e.target.value as 'depth' | 'seo' | 'engagement' | 'examples' | 'all');
  }, []);

  const handleBoostInstructionsChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBoostInstructions(e.target.value);
  }, []);

  const handleOpenBoostModal = React.useCallback(() => {
    setBoostType('all');
    setBoostInstructions('');
    setShowBoostModal(true);
  }, []);

  const handleCloseBoostModal = React.useCallback(() => {
    setShowBoostModal(false);
  }, []);

  // Função para impulsionar o conteúdo
  const handleBoostContent = React.useCallback(async () => {
    if (!currentItem) return;
    
    setIsBoosting(true);
    setBoostProgress('');
    
    // Iniciar atualizações de progresso
    const progressInterval = setInterval(() => {
      setBoostProgress(prev => {
        const dots = prev.match(/\./g)?.length || 0;
        return dots < 3 ? '.'.repeat(dots + 1) : '';
      });
    }, 500);
    
    try {
      // Mensagens informativas de progresso
      setTimeout(() => setBoostProgress(' (analisando conteúdo)'), 2000);
      setTimeout(() => setBoostProgress(' (identificando áreas para melhoria)'), 5000);
      setTimeout(() => setBoostProgress(' (expandindo conteúdo)'), 10000);
      setTimeout(() => setBoostProgress(' (adicionando detalhes)'), 20000);
      setTimeout(() => setBoostProgress(' (finalizando melhorias)'), 40000);
      
      const boostedContent = await aiService.boostContent({
        existingContent: currentItem.content,
        existingTitle: currentItem.title,
        boostType,
        additionalInstructions: boostInstructions
      });
      
      // Atualizar o item atual com o conteúdo impulsionado
      setCurrentItem({
        ...currentItem,
        content: boostedContent,
        // Marcar que o conteúdo foi impulsionado pela IA
        author: currentItem.author.includes('(Impulsionado)') 
          ? currentItem.author 
          : `${currentItem.author} (Impulsionado)`
      });
      
      // Fechar o modal de impulso
      setShowBoostModal(false);
      
      // Mostrar mensagem de sucesso
      setSaveMessage('Conteúdo impulsionado com sucesso! Revise e salve para publicar.');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Erro ao impulsionar conteúdo com IA:', error);
      alert(`Erro ao impulsionar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      clearInterval(progressInterval);
      setBoostProgress('');
      setIsBoosting(false);
    }
  }, [currentItem, boostType, boostInstructions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md relative overflow-hidden"
        >
          <div className="text-center mb-6 relative">
            <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-gray-600 mt-2">
              Você não tem permissões para acessar o painel de administração.
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              Redirecionando para a página inicial...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isEditing && currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Voltar</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleOpenBoostModal}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg flex items-center hover:bg-amber-200 transition-colors"
                  disabled={!currentItem?.content}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Impulsionar</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleOpenAiModal}
                  className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg flex items-center hover:bg-violet-200 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Gerar com IA</span>
                </button>
                
                <button 
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center hover:bg-emerald-200 transition-colors"
                  onClick={() => window.open(`/content/${currentItem.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span>Pré-visualizar</span>
                </button>
                
                <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {saveMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                {saveMessage}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input 
                  type="text" 
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite o título do conteúdo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input 
                  type="text" 
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite uma breve descrição"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input 
                    type="url"
                    value={currentItem.image_url}
                    onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL da imagem de capa do conteúdo
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Externa (opcional)</label>
                  <input 
                    type="url"
                    value={currentItem.external_url || ''}
                    onChange={(e) => setCurrentItem({...currentItem, external_url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/artigo"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Se houver um link externo para o conteúdo completo
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select 
                    value={currentItem.status}
                    onChange={(e) => setCurrentItem({...currentItem, status: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="scheduled">Agendado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input 
                    type="text"
                    value={currentItem.author}
                    onChange={(e) => setCurrentItem({...currentItem, author: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {currentItem.author === 'AI Deepseek V3' && (
                    <div className="mt-2 bg-violet-50 border border-violet-100 text-violet-700 p-2 rounded-lg text-sm flex items-start">
                      <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p>Este conteúdo foi gerado pela nossa API de IA Deepseek V3. Revise e edite conforme necessário antes de publicar.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  value={currentItem.tags?.join(', ') || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="marketing, copywriting, instagram"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                <div className="border border-gray-300 rounded-lg">
                  <ReactQuill 
                    value={currentItem.content}
                    onChange={(content) => setCurrentItem({...currentItem, content})}
                    className="min-h-[300px]"
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image', 'video'],
                        ['blockquote', 'code-block'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet',
                      'indent',
                      'align',
                      'color', 'background',
                      'link', 'image', 'video',
                      'blockquote', 'code-block'
                    ]}
                    style={{ height: '350px' }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Editor de texto rico com suporte a formatação avançada
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                {isEditing ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
        {/* Renderizar o modal de IA */}
        <AiModal 
          show={showAiModal}
          topic={aiTopic}
          additionalInfo={aiAdditionalInfo}
          customAuthor={aiCustomAuthor}
          tone={aiTone}
          targetAudience={aiTargetAudience}
          contentLength={aiContentLength}
          includeHeaders={aiIncludeHeaders}
          includeFAQs={aiIncludeFAQs}
          isGenerating={isGeneratingAI}
          generationProgress={generationProgress}
          onClose={handleCloseAiModal}
          onGenerate={handleGenerateWithAI}
          onTopicChange={handleAiTopicChange}
          onInfoChange={handleAiInfoChange}
          onAuthorChange={handleAiAuthorChange}
          onToneChange={handleAiToneChange}
          onTargetAudienceChange={handleAiTargetAudienceChange}
          onContentLengthChange={handleAiContentLengthChange}
          onIncludeHeadersChange={handleAiIncludeHeadersChange}
          onIncludeFAQsChange={handleAiIncludeFAQsChange}
        />
        {/* Renderizar o modal de impulso */}
        <BoostModal
          show={showBoostModal}
          title={currentItem?.title || ''}
          boostType={boostType}
          additionalInstructions={boostInstructions}
          isBoosting={isBoosting}
          boostProgress={boostProgress}
          onClose={handleCloseBoostModal}
          onBoost={handleBoostContent}
          onBoostTypeChange={handleBoostTypeChange}
          onInstructionsChange={handleBoostInstructionsChange}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/dashboard/admin/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-emerald-600" />
                Gerenciamento de Conteúdos Relevantes
              </h1>
              <p className="text-gray-600 mt-1">
                Publique, edite e gerencie conteúdos relevantes para seus usuários
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button 
                onClick={handleOpenAiModal}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-violet-700 transition-colors flex items-center"
              >
                <Sparkles className="h-5 w-5 mr-1" />
                <span>Gerar com IA</span>
              </button>
              
              <button 
                onClick={handleAddNew}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                <span>Novo Conteúdo</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Conteúdos Relevantes
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-44"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="published">Publicados</option>
                      <option value="draft">Rascunhos</option>
                      <option value="scheduled">Agendados</option>
                      <option value="pending">Pendentes</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {saveMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                  {saveMessage}
                </div>
              )}
              
              <div className="mt-4 overflow-hidden">
                {filteredContent.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum conteúdo encontrado</h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Nenhum resultado para "${searchTerm}". Tente outra busca.`
                        : statusFilter !== 'all'
                          ? `Não há conteúdos com status "${statusFilter}". Selecione outro filtro.`
                          : 'Não há conteúdos cadastrados. Crie um novo conteúdo ou gere com IA.'}
                    </p>
                    <div className="mt-4 flex justify-center space-x-3">
                      <button 
                        onClick={handleOpenAiModal}
                        className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg inline-flex items-center hover:bg-violet-200 transition-colors"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span>Gerar com IA</span>
                      </button>
                      <button 
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center hover:bg-emerald-200 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Criar Novo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredContent.map(item => (
                          <tr key={item.id} className={`hover:bg-gray-50 ${item.status === 'pending' ? 'bg-amber-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                {item.tags && item.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                                {item.tags && item.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${item.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                                ${item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${item.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                                ${item.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                              `}>
                                {item.status === 'published' && 'Publicado'}
                                {item.status === 'draft' && 'Rascunho'}
                                {item.status === 'scheduled' && 'Agendado'}
                                {item.status === 'pending' && 'Pendente'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(item.updated_at)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-700">
                                {item.author}
                                {item.author === 'AI Deepseek V3' && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                    IA
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {item.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveContent(item.id);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                      title="Aprovar conteúdo"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Tem certeza que deseja rejeitar e excluir este conteúdo?')) {
                                          handleRejectContent(item.id);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                      title="Rejeitar conteúdo"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                
                                {item.external_url && (
                                  <a 
                                    href={item.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                    title="Abrir link externo"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <LinkIcon className="h-5 w-5" />
                                  </a>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditItem(item);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Editar conteúdo"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/dashboard/learning/free-courses?preview=${item.id}`, '_blank');
                                  }}
                                  className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                  title="Pré-visualizar conteúdo"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
                                      handleDeleteItem(item.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Excluir conteúdo"
                                >
                                  <Trash className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Renderizar o modal de IA */}
      <AiModal 
        show={showAiModal}
        topic={aiTopic}
        additionalInfo={aiAdditionalInfo}
        customAuthor={aiCustomAuthor}
        tone={aiTone}
        targetAudience={aiTargetAudience}
        contentLength={aiContentLength}
        includeHeaders={aiIncludeHeaders}
        includeFAQs={aiIncludeFAQs}
        isGenerating={isGeneratingAI}
        generationProgress={generationProgress}
        onClose={handleCloseAiModal}
        onGenerate={handleGenerateWithAI}
        onTopicChange={handleAiTopicChange}
        onInfoChange={handleAiInfoChange}
        onAuthorChange={handleAiAuthorChange}
        onToneChange={handleAiToneChange}
        onTargetAudienceChange={handleAiTargetAudienceChange}
        onContentLengthChange={handleAiContentLengthChange}
        onIncludeHeadersChange={handleAiIncludeHeadersChange}
        onIncludeFAQsChange={handleAiIncludeFAQsChange}
      />
    </div>
  );
};

export default AdminContent; 