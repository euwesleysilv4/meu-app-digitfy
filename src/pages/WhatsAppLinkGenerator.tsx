import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Smile,
  QrCode,
  Copy,
  Share2,
  Phone,
  Check,
  Link as LinkIcon,
  X
} from 'lucide-react';

const WhatsAppLinkGenerator = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [generateQR, setGenerateQR] = useState(false);
  const [receiveLink, setReceiveLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGenerateLink = () => {
    // Remove caracteres não numéricos do número de telefone
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Gera o link do WhatsApp
    const whatsappLink = `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
    
    setGeneratedLink(whatsappLink);
    setShowModal(true); // Abre o modal quando o link é gerado
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset após 2 segundos
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Crie Link WhatsApp: Gerador Grátis
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
            Crie links personalizados para WhatsApp gratuitamente. Ideal para marketing, 
            atendimento ao cliente e campanhas promocionais.
          </p>
        </motion.div>

        {/* Área Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Campo Telefone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Seu número de WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                  placeholder="(00) 00000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email (Opcional)
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Editor de Mensagem */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mensagem personalizada
                <span className="ml-1 text-gray-400">(opcional)</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Barra de Ferramentas */}
                <div className="bg-gray-50 p-2 border-b border-gray-300 flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Bold className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Italic className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Underline className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Strikethrough className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <Smile className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                {/* Campo de Texto */}
                <textarea
                  className="w-full p-3 min-h-[150px] focus:ring-0 border-0"
                  placeholder="Ex: Olá! Gostaria de saber mais sobre seus produtos 😊"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            {/* Opções */}
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={receiveLink}
                  onChange={(e) => setReceiveLink(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Receber link no WhatsApp</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={generateQR}
                  onChange={(e) => setGenerateQR(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Gerar QR Code</span>
              </label>
            </div>

            {/* Botão Gerar */}
            <button
              onClick={handleGenerateLink}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Gerar Link</span>
              <Share2 className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Preview */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Preview da Mensagem no WhatsApp
            </h2>
            <p className="text-sm text-gray-600">
              Confira nessa pré-visualização como os usuários verão a sua mensagem do link de WhatsApp
            </p>
            
            {/* Mock WhatsApp */}
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
              {/* Header */}
              <div className="bg-emerald-700 text-white p-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {phoneNumber || '(00) 00000-0000'}
                    </p>
                    <p className="text-xs text-emerald-100">online</p>
                  </div>
                </div>
              </div>
              
              {/* Chat */}
              <div className="bg-[#e5ddd5] p-4 min-h-[300px]">
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%] ml-auto">
                  <p className="text-gray-700">
                    {message || 'Sua mensagem aparecerá aqui...'}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code (condicional) */}
            {generateQR && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white text-center">
                <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">QR Code será gerado aqui</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Área do Link Gerado - Adicionar após o botão "Gerar Link" */}
        {generatedLink && (
          <motion.div 
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-lg border border-emerald-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-700">Link Gerado:</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    copied 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg break-all">
                <code className="text-sm text-gray-800">{generatedLink}</code>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-4">
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Abrir no WhatsApp</span>
              </a>
              {generateQR && (
                <button className="flex-1 bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Baixar QR Code</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Dicas de Uso */}
        <motion.div 
          className="bg-gray-50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dicas para usar o gerador de link
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Use emojis para tornar suas mensagens mais atrativas</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Mantenha suas mensagens curtas e objetivas</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Personalize a mensagem de acordo com seu público</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Modal do Link Gerado */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()} // Evita que o clique feche o modal
              >
                {/* Conteúdo do Modal */}
                <div className="p-6">
                  {/* Cabeçalho do Modal */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 p-2.5 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Link Gerado com Sucesso!
                      </h3>
                    </div>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Preview do Link */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <span className="text-sm text-gray-600">Seu link do WhatsApp:</span>
                        <button
                          onClick={handleCopyLink}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                            copied 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 break-all">
                        <code className="text-sm text-gray-800">{generatedLink}</code>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                      
                      {generateQR && (
                        <button className="w-full bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2">
                          <QrCode className="h-5 w-5" />
                          <span>Baixar QR Code</span>
                        </button>
                      )}
                    </div>

                    {/* Dica */}
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">💡</span>
                        <p className="text-sm text-emerald-700">
                          Você pode compartilhar este link em suas redes sociais, 
                          email ou qualquer outro canal de comunicação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppLinkGenerator; 