import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Zap, Eye, EyeOff, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  // Verificar se há parâmetro register na URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true') {
      setIsLogin(false);
    }
  }, [location]);
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log('Auth: Sessão existente detectada, redirecionando...');
          window.location.href = '/';
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth: Erro ao verificar sessão:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const validateForm = () => {
    setError(null);
    
    if (!email.trim()) {
      setError('O e-mail é obrigatório');
      return false;
    }
    
    if (!password) {
      setError('A senha é obrigatória');
      return false;
    }
    
    if (!isLogin) {
      if (!nome.trim()) {
        setError('O nome é obrigatório');
        return false;
      }
      
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificação básica de campos vazios
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail');
      return;
    }
    
    if (!password.trim()) {
      setError('Por favor, informe sua senha');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Auth: Tentando login direto com Supabase');
      
      // Limpar qualquer sessão existente antes de tentar login
      await supabase.auth.signOut();
      
      // Usar diretamente o cliente Supabase para login, evitando camadas intermediárias
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Verificar se houve erro na autenticação
      if (error) {
        console.error('Auth: Erro direto do Supabase:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(error.message || 'Erro ao fazer login');
        }
        setLoading(false);
        return;
      }
      
      // Verificar se a sessão foi criada corretamente
      if (!data || !data.session) {
        console.error('Auth: Login sem sessão retornada');
        setError('Falha ao criar sessão. Tente novamente.');
        setLoading(false);
        return;
      }
      
      console.log('Auth: Login bem-sucedido, redirecionando...');
      
      // Forçar redirecionamento para dashboard após o login bem-sucedido
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Auth: Exceção durante login:', err);
      setError(err.message || 'Erro desconhecido durante o login');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Auth: Tentando cadastrar usuário', { email, nome, whatsapp });
      
      // Verificações adicionais
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }
      
      // Limpar qualquer sessão existente antes de tentar cadastro
      await supabase.auth.signOut();
      
      // Chamar a função de cadastro
      const { error } = await signUp(email, password, nome, whatsapp);
      
      if (error) {
        console.error('Auth: Erro no cadastro:', error);
        
        // Mensagens de erro específicas
        if (typeof error === 'string') {
          setError(error);
        } else if (error.message?.includes('already registered')) {
          setError('Este e-mail já está cadastrado');
        } else if (error.message?.includes('password')) {
          setError('A senha deve ter pelo menos 6 caracteres');
        } else if (error.message?.includes('email')) {
          setError('Email inválido');
        } else {
          setError(error.message || 'Erro ao criar conta');
        }
        
        setLoading(false);
        return;
      }
      
      // Salvar o email registrado para mostrar no modal
      setRegisteredEmail(email);
      
      // Mostrar modal de verificação em vez de alert
      setShowVerificationModal(true);
      
      // Limpar os campos do formulário
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNome('');
      setWhatsapp('');
      
      setLoading(false);
      setIsLogin(true);
    } catch (err: any) {
      console.error('Auth: Exceção durante cadastro:', err);
      setError(err.message || 'Erro desconhecido durante o cadastro');
      setLoading(false);
    }
  };

  // Modal de verificação de email
  const EmailVerificationModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up relative">
        <button 
          onClick={() => setShowVerificationModal(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Verifique seu email</h3>
          <p className="text-gray-600">
            Enviamos um link de verificação para:
          </p>
          <p className="font-medium text-emerald-600 mt-1 break-all">
            {registeredEmail}
          </p>
        </div>
        
        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
          <div className="flex space-x-3">
            <div className="flex-shrink-0 text-emerald-500 mt-0.5">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Por favor, verifique sua caixa de entrada (e pasta de spam) e clique no link de verificação enviado para ativar sua conta. Após clicar e verificar, basta voltar aqui e fazer o login normalmente.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowVerificationModal(false)}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modal de verificação de email */}
      {showVerificationModal && <EmailVerificationModal />}
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-transparent p-0 rounded-xl shadow-lg shadow-emerald-500/20 animate-bounce-subtle">
              <img 
                src="/novas%20logos/fav-icon-digitfy-esmeralda.png" 
                alt="DigitFy" 
                className="w-14 h-14" 
              />
            </div>
            <div className="flex items-baseline">
              <h1 className="text-4xl font-bold text-emerald-500 animate-pulse-text">DigitFy</h1>
              <span className="text-xs text-emerald-500 ml-0.5">.com.br</span>
            </div>
          </div>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 animate-slide-up border border-white/50">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 animate-fade-in">
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta gratuitamente'}
            </h2>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2 animate-fade-in">
                  <label className="text-sm font-medium text-gray-700">Nome completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-500"
                      placeholder="Digite seu nome"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-fade-in">
                  <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-emerald-500">
                      +55
                    </div>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="block w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-500"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-500"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-gray-700">Confirme sua senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-500"
                    placeholder="Digite sua senha novamente"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox de Termos e Política - Apenas na tela de criar conta */}
            {!isLogin && (
              <div className="flex items-start space-x-3 animate-fade-in">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    Li e aceito os{' '}
                    <a href="/termos" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Termos de Uso
                    </a>{' '}
                    e a{' '}
                    <a href="/privacidade" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Política de Privacidade
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Botão de ação */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium transition-all shadow-lg ${
                loading
                  ? 'bg-emerald-400 cursor-not-allowed shadow-emerald-400/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-emerald-500/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors hover:underline"
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
          
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/reset-password')}
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 