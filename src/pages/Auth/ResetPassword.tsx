import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('O e-mail é obrigatório');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) throw resetError;
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      setError(err.message || 'Ocorreu um erro ao solicitar a redefinição de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background com raios */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Raio superior esquerdo */}
        <div className="absolute top-20 left-20 transform -rotate-45">
          <div className="w-64 h-2 bg-emerald-300/50 rounded-full blur-xl"></div>
          <div className="w-32 h-2 bg-emerald-300/50 rounded-full blur-xl mt-8 ml-4 rotate-45"></div>
        </div>
        
        {/* Raio superior direito */}
        <div className="absolute top-40 right-20 transform rotate-45">
          <div className="w-64 h-2 bg-teal-300/50 rounded-full blur-xl"></div>
          <div className="w-32 h-2 bg-teal-300/50 rounded-full blur-xl mt-8 -ml-4 -rotate-45"></div>
        </div>
        
        {/* Raio inferior */}
        <div className="absolute bottom-32 left-1/3 transform">
          <div className="w-64 h-2 bg-emerald-400/50 rounded-full blur-xl"></div>
          <div className="w-32 h-2 bg-emerald-400/50 rounded-full blur-xl mt-8 ml-4 rotate-45"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 scale-in-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <Zap size={32} />
            </div>
            <div className="flex items-baseline">
              <h1 className="text-4xl font-bold text-emerald-800">DigitFy</h1>
              <span className="text-sm text-emerald-600/60 ml-0.5">.com.br</span>
            </div>
          </div>
        </div>

        {/* Card de Redefinição de Senha */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 slide-up">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 fade-in">
              {success ? 'E-mail enviado!' : 'Recuperar senha'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
              {success 
                ? 'Verifique seu e-mail para instruções de redefinição de senha.' 
                : 'Informe seu e-mail para receber instruções de recuperação de senha.'}
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 fade-in">
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Enviando...' : 'Enviar instruções'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-emerald-600">
                  Um e-mail com instruções para redefinir sua senha foi enviado para <strong>{email}</strong>.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 