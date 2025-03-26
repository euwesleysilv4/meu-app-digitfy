import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Mail, 
  Bell, 
  Shield, 
  Database, 
  Users,
  Save,
  Undo,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  settings: Setting[];
}

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea' | 'color';
  value: any;
  options?: { value: string; label: string }[];
}

const AdminSettings: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<SettingCategory[]>([]);
  const [savedMessage, setSavedMessage] = useState('');
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
          // Carregar configurações
          loadSettings();
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

  const loadSettings = () => {
    // Simulando carregamento de configurações do banco de dados
    const demoSettings: SettingCategory[] = [
      {
        id: 'general',
        name: 'Geral',
        icon: <Settings className="h-5 w-5" />,
        settings: [
          {
            id: 'site_name',
            name: 'Nome do Site',
            description: 'O nome principal do site exibido no cabeçalho e título',
            type: 'input',
            value: 'DigitFy'
          },
          {
            id: 'site_description',
            name: 'Descrição do Site',
            description: 'Uma breve descrição do site para SEO e metadados',
            type: 'textarea',
            value: 'Plataforma digital para criadores de conteúdo e profissionais de marketing.'
          },
          {
            id: 'maintenance_mode',
            name: 'Modo de Manutenção',
            description: 'Ativar o modo de manutenção para todos os usuários não-administradores',
            type: 'toggle',
            value: false
          },
          {
            id: 'theme',
            name: 'Tema do Painel',
            description: 'Escolha o tema para o painel administrativo',
            type: 'select',
            value: 'light',
            options: [
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
              { value: 'system', label: 'Sistema' }
            ]
          }
        ]
      },
      {
        id: 'appearance',
        name: 'Aparência',
        icon: <Globe className="h-5 w-5" />,
        settings: [
          {
            id: 'primary_color',
            name: 'Cor Primária',
            description: 'A cor principal do tema do site',
            type: 'color',
            value: '#10b981'
          },
          {
            id: 'secondary_color',
            name: 'Cor Secundária',
            description: 'A cor secundária do tema do site',
            type: 'color',
            value: '#0ea5e9'
          },
          {
            id: 'logo_url',
            name: 'URL do Logo',
            description: 'URL para a imagem do logo principal',
            type: 'input',
            value: '/logo.svg'
          },
          {
            id: 'favicon_url',
            name: 'URL do Favicon',
            description: 'URL para o favicon do site',
            type: 'input',
            value: '/favicon.ico'
          }
        ]
      },
      {
        id: 'notifications',
        name: 'Notificações',
        icon: <Bell className="h-5 w-5" />,
        settings: [
          {
            id: 'email_notifications',
            name: 'Notificações por Email',
            description: 'Enviar notificações por email para eventos importantes',
            type: 'toggle',
            value: true
          },
          {
            id: 'push_notifications',
            name: 'Notificações Push',
            description: 'Habilitar notificações push para usuários',
            type: 'toggle',
            value: true
          },
          {
            id: 'notification_frequency',
            name: 'Frequência de Resumos',
            description: 'Com que frequência enviar e-mails de resumo',
            type: 'select',
            value: 'daily',
            options: [
              { value: 'daily', label: 'Diariamente' },
              { value: 'weekly', label: 'Semanalmente' },
              { value: 'monthly', label: 'Mensalmente' },
              { value: 'never', label: 'Nunca' }
            ]
          }
        ]
      },
      {
        id: 'security',
        name: 'Segurança',
        icon: <Shield className="h-5 w-5" />,
        settings: [
          {
            id: 'force_ssl',
            name: 'Forçar SSL',
            description: 'Redirecionar todo o tráfego para HTTPS',
            type: 'toggle',
            value: true
          },
          {
            id: 'login_attempts',
            name: 'Tentativas de Login',
            description: 'Número máximo de tentativas de login antes do bloqueio',
            type: 'input',
            value: '5'
          },
          {
            id: 'session_timeout',
            name: 'Timeout de Sessão',
            description: 'Tempo em minutos antes da sessão expirar (0 = nunca)',
            type: 'input',
            value: '60'
          },
          {
            id: 'two_factor_auth',
            name: 'Autenticação de Dois Fatores',
            description: 'Exigir 2FA para todos os administradores',
            type: 'toggle',
            value: false
          }
        ]
      },
      {
        id: 'email',
        name: 'Email',
        icon: <Mail className="h-5 w-5" />,
        settings: [
          {
            id: 'smtp_host',
            name: 'Host SMTP',
            description: 'Servidor SMTP para envio de emails',
            type: 'input',
            value: 'smtp.example.com'
          },
          {
            id: 'smtp_port',
            name: 'Porta SMTP',
            description: 'Porta para o servidor SMTP',
            type: 'input',
            value: '587'
          },
          {
            id: 'smtp_username',
            name: 'Usuário SMTP',
            description: 'Nome de usuário para autenticação SMTP',
            type: 'input',
            value: 'noreply@example.com'
          },
          {
            id: 'smtp_password',
            name: 'Senha SMTP',
            description: 'Senha para autenticação SMTP',
            type: 'input',
            value: '********'
          }
        ]
      }
    ];
    
    setSettings(demoSettings);
  };

  const handleChange = (categoryId: string, settingId: string, value: any) => {
    setSettings(prevSettings => {
      return prevSettings.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            settings: category.settings.map(setting => {
              if (setting.id === settingId) {
                return {
                  ...setting,
                  value
                };
              }
              return setting;
            })
          };
        }
        return category;
      });
    });
    
    setHasChanges(true);
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar no banco de dados
    console.log('Salvando configurações:', settings);
    
    // Simulando o salvamento
    setTimeout(() => {
      setSavedMessage('Configurações salvas com sucesso!');
      setHasChanges(false);
      
      // Remover a mensagem após alguns segundos
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    }, 1000);
  };

  const handleReset = () => {
    loadSettings();
    setHasChanges(false);
  };

  const renderSettingControl = (category: SettingCategory, setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center">
            <button
              onClick={() => handleChange(category.id, setting.id, !setting.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                setting.value ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-700">
              {setting.value ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        );
      
      case 'input':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleChange(category.id, setting.id, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleChange(category.id, setting.id, e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        );
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleChange(category.id, setting.id, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={setting.value}
              onChange={(e) => handleChange(category.id, setting.id, e.target.value)}
              className="h-8 w-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={setting.value}
              onChange={(e) => handleChange(category.id, setting.id, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
          
          <motion.div 
            className="absolute -z-10 w-32 h-32 rounded-full bg-emerald-300/20 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
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
          <motion.div 
            className="absolute -z-10 top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full -mt-20 -mr-20 blur-2xl"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="text-center mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="h-10 w-10 text-emerald-500" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-800"
            >
              Acesso Restrito
            </motion.h1>
            
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mt-2"
            >
              Você não tem permissões para acessar as configurações do sistema.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-500 mt-4 text-sm">
                Redirecionando para a página inicial...
              </p>
              
              <div className="w-full bg-gray-100 h-1 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/dashboard/admin/dashboard" 
                className="mr-4 p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-emerald-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Undo className="mr-1.5 h-4 w-4" />
                    Desfazer
                  </button>
                  
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-emerald-600 rounded-md text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    Salvar Alterações
                  </button>
                </>
              )}
              
              {settings.find(c => c.id === 'general')?.settings.find(s => s.id === 'theme')?.value === 'light' ? (
                <button className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors">
                  <Moon className="h-5 w-5 text-gray-600" />
                </button>
              ) : (
                <button className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors">
                  <Sun className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          {savedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {savedMessage}
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar com categorias */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <nav className="flex flex-col">
                {settings.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-4 py-3 text-left transition-colors ${
                      activeCategory === category.id 
                        ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mr-3 ${activeCategory === category.id ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {category.icon}
                    </span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {settings.map((category) => (
                <div 
                  key={category.id} 
                  className={activeCategory === category.id ? 'block' : 'hidden'}
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                    {category.name}
                  </h2>
                  
                  <div className="space-y-6">
                    {category.settings.map((setting) => (
                      <div key={setting.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        <div className="lg:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {setting.name}
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            {setting.description}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          {renderSettingControl(category, setting)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 