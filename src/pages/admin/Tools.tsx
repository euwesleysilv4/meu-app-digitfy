import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
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
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Tipos de ferramenta que podem ser gerenciados
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  image_url: string;
  status: 'published' | 'draft' | 'scheduled';
  is_free: boolean;
  is_online: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  view_count: number;
  priority: number;
}

const AdminTools: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

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
          // Carregar ferramentas
          loadTools();
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

  const loadTools = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar ferramentas:', error);
        throw error;
      }
      
      setTools(data || []);
    } catch (err) {
      console.error('Falha ao carregar ferramentas:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setTools([
        {
          id: '1',
          title: 'Trend Rush',
          description: 'Descubra as tendências do momento',
          icon: 'Music',
          path: '/tools/trend-rush',
          color: 'violet',
          image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          is_free: true,
          is_online: true,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 0,
          priority: 1
        },
        {
          id: '2',
          title: 'Comparador de Plataformas',
          description: 'Compare comissões e recursos entre plataformas',
          icon: 'Scale',
          path: '/tools/commission-calculator',
          color: 'emerald',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          is_free: true,
          is_online: true,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 0,
          priority: 2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.path.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  const handleEditTool = (tool: Tool) => {
    setCurrentTool(tool);
    setIsEditing(true);
  };
  
  const handleDeleteTool = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ferramenta? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('tools')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setTools(tools.filter(tool => tool.id !== id));
      } catch (err) {
        console.error('Erro ao excluir ferramenta:', err);
        alert('Não foi possível excluir a ferramenta. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newTool: Tool = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Nova Ferramenta',
      description: 'Breve descrição da ferramenta',
      icon: 'Wrench',
      path: '/tools/new-tool',
      color: 'emerald',
      image_url: '',
      status: 'draft',
      is_free: true,
      is_online: true,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      priority: tools.length + 1
    };
    
    setCurrentTool(newTool);
    setIsEditing(true);
  };

  const handleSaveTool = async () => {
    if (!currentTool) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validação básica
      if (!currentTool.title || !currentTool.description || !currentTool.path) {
        throw new Error('Por favor, preencha pelo menos título, descrição e caminho URL');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewItem = !tools.some(tool => tool.id === currentTool.id);
      
      // Atualizar o timestamp e adicionar o userId como created_by
      const updatedTool = {
        ...currentTool,
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        created_by: userId // Adicionar o ID do usuário atual
      };
      
      // Para debugging - mostrar os dados que serão enviados
      console.log('Dados a serem enviados:', updatedTool);
      
      let result;
      
      if (isNewItem) {
        // Inserir novo registro
        console.log('Criando nova ferramenta...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...itemWithoutId } = updatedTool;
        if (!id) {
          result = await supabase
            .from('tools')
            .insert([itemWithoutId]);
        } else {
          result = await supabase
            .from('tools')
            .insert([updatedTool]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando ferramenta existente...');
        result = await supabase
          .from('tools')
          .update(updatedTool)
          .eq('id', updatedTool.id);
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
        await loadTools();
      } else {
        setTools(tools.map(tool => 
          tool.id === updatedTool.id ? updatedTool : tool
        ));
      }
      
      setSaveMessage('Ferramenta salva com sucesso!');
      
      // Voltar para a listagem após 1 segundo
      setTimeout(() => {
        setIsEditing(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao salvar ferramenta:', err);
      
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
        const { error: pingError } = await supabase.from('tools').select('count(*)');
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

  if (isEditing && currentTool) {
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
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center hover:bg-emerald-200 transition-colors"
                  onClick={() => window.open(currentTool.path, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span>Pré-visualizar</span>
                </button>
                
                <button 
                  onClick={handleSaveTool}
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
              <div className={`mb-6 p-3 rounded-lg ${saveMessage.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {saveMessage}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input 
                  type="text" 
                  value={currentTool.title}
                  onChange={(e) => setCurrentTool({...currentTool, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite o título da ferramenta"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input 
                  type="text" 
                  value={currentTool.description}
                  onChange={(e) => setCurrentTool({...currentTool, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite uma breve descrição"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone *</label>
                  <input 
                    type="text"
                    value={currentTool.icon}
                    onChange={(e) => setCurrentTool({...currentTool, icon: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nome do ícone do Lucide React (ex: Music, Wrench)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nome exato do ícone do Lucide React (sensível a maiúsculas/minúsculas)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor *</label>
                  <input 
                    type="text"
                    value={currentTool.color}
                    onChange={(e) => setCurrentTool({...currentTool, color: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="emerald, blue, purple, etc."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Cor temática da ferramenta (ex: emerald, blue, purple)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input 
                    type="url"
                    value={currentTool.image_url}
                    onChange={(e) => setCurrentTool({...currentTool, image_url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL da imagem de capa da ferramenta
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caminho URL *</label>
                  <input 
                    type="text"
                    value={currentTool.path}
                    onChange={(e) => setCurrentTool({...currentTool, path: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="/tools/nome-da-ferramenta"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Caminho para acessar a ferramenta (ex: /tools/trend-rush)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select 
                    value={currentTool.status}
                    onChange={(e) => setCurrentTool({...currentTool, status: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="scheduled">Agendado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <input 
                    type="number" 
                    value={currentTool.priority}
                    onChange={(e) => setCurrentTool({...currentTool, priority: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ordem de exibição"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ordem de exibição (quanto menor, maior prioridade)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visualizações</label>
                  <input 
                    type="number" 
                    value={currentTool.view_count}
                    onChange={(e) => setCurrentTool({...currentTool, view_count: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="is_free"
                    checked={currentTool.is_free}
                    onChange={(e) => setCurrentTool({...currentTool, is_free: e.target.checked})}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_free" className="ml-2 block text-sm text-gray-700">
                    É gratuito
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="is_online"
                    checked={currentTool.is_online}
                    onChange={(e) => setCurrentTool({...currentTool, is_online: e.target.checked})}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_online" className="ml-2 block text-sm text-gray-700">
                    Está online
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <Wrench className="h-8 w-8 mr-3 text-emerald-600" />
                Gerenciamento de Ferramentas
              </h1>
              <p className="text-gray-600 mt-1">
                Publique, edite e gerencie as ferramentas disponíveis na plataforma
              </p>
            </div>
            
            <button 
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Nova Ferramenta</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Ferramentas Disponíveis
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar ferramenta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mt-4 overflow-hidden">
                {filteredTools.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma ferramenta encontrada</h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Nenhum resultado para "${searchTerm}". Tente outra busca.`
                        : 'Não há ferramentas cadastradas. Crie uma nova ferramenta.'}
                    </p>
                    <button 
                      onClick={handleAddNew}
                      className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center hover:bg-emerald-200 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Criar Nova</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caminho</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gratuita</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredTools.map(tool => (
                          <tr key={tool.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{tool.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{tool.description}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${tool.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                                ${tool.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${tool.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {tool.status === 'published' && 'Publicado'}
                                {tool.status === 'draft' && 'Rascunho'}
                                {tool.status === 'scheduled' && 'Agendado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {tool.path}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {tool.priority}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${tool.is_free ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                              `}>
                                {tool.is_free ? 'Sim' : 'Não'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <a 
                                  href={tool.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                  title="Abrir ferramenta"
                                >
                                  <LinkIcon className="h-5 w-5" />
                                </a>
                                <button 
                                  onClick={() => handleEditTool(tool)}
                                  className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                  title="Editar ferramenta"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTool(tool.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Excluir ferramenta"
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
    </div>
  );
};

export default AdminTools; 