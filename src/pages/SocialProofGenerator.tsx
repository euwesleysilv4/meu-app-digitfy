import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ThumbsUp, 
  Star, 
  MessageSquare, 
  Image as ImageIcon,
  Clock,
  User,
  Download,
  Copy,
  Check,
  Camera
} from 'lucide-react';

type ProofType = 'whatsapp' | 'instagram';

interface SocialProof {
  type: ProofType;
  name: string;
  message?: string;
  time?: string;
  image?: string;
}

const SocialProofGenerator = () => {
  const [proofType, setProofType] = useState<ProofType>('whatsapp');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('Agora mesmo');
  const [image, setImage] = useState('');
  const [copied, setCopied] = useState(false);

  const proofTypes = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: ImageIcon,
      description: 'Mostra uma conversa no WhatsApp'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: ImageIcon,
      description: 'Mostra uma conversa no Instagram'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateProof = (): SocialProof => {
    return {
      type: proofType,
      name,
      message,
      time,
      image
    };
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
          <Users className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerador de Provas Sociais
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
            Crie provas sociais personalizadas para aumentar a credibilidade e 
            confiança em suas páginas de vendas, landing pages e anúncios.
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
            {/* Seleção do Tipo */}
            <div className="grid grid-cols-2 gap-4">
              {proofTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProofType(type.id as ProofType)}
                  className={`p-4 rounded-xl border transition-all duration-300 text-left space-y-2 ${
                    proofType === type.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <type.icon className={`h-6 w-6 ${
                    proofType === type.id ? 'text-emerald-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{type.label}</h3>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Campos comuns */}
            <div className="space-y-4">
              {/* Nome (comum a todos) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                  placeholder="Ex: João Silva"
                />
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                  rows={3}
                  placeholder="Digite a mensagem que aparecerá na conversa..."
                />
              </div>

              {/* Foto do perfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto do Perfil
                </label>
                <div className="flex items-center space-x-4">
                  {image && (
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <Camera className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Escolher Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Tempo (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário (opcional)
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
                  placeholder="Ex: 12:30"
                />
              </div>
            </div>

            {/* Botão Gerar */}
            <button
              onClick={() => {
                const proof = generateProof();
                console.log(proof); // Aqui você pode implementar a lógica de geração
              }}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Gerar Prova Social</span>
              <Download className="h-5 w-5" />
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
              Preview da Prova Social
            </h2>

            {/* Preview dinâmico baseado no tipo */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              {proofType === 'whatsapp' && (
                <div className="overflow-hidden rounded-2xl border border-gray-300 shadow-md max-w-[320px] mx-auto" style={{ maxHeight: '550px' }}>
                  {/* Barra de status do telefone (iOS) */}
                  <div className="bg-black text-white py-1 px-4 text-xs flex justify-between items-center">
                    <div>9:41</div>
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"></path><path d="M2 10a10 10 0 0 1 20 0"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"></path><path d="M3 14h.01"></path><path d="M7 14h.01"></path><path d="M11 14h.01"></path><path d="M15 14h.01"></path><rect width="16" height="12" x="4" y="6" rx="2"></rect></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="4" width="10" height="16" rx="1"></rect><path d="M11 5h2"></path><path d="M12 17v.01"></path></svg>
                    </div>
                  </div>

                  {/* WhatsApp UI - Header */}
                  <div className="bg-[#075E54] p-2 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {image ? (
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-1 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">{name || 'Issy Lina'}</h3>
                      <p className="text-[10px] text-green-100">typing...</p>
                    </div>
                    <div className="flex text-white space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </div>
                  </div>
                  
                  {/* WhatsApp UI - Chat Background */}
                  <div className="bg-[#E5DDD5] p-3 h-[350px] overflow-y-auto space-y-4" style={{ backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH5AcPESEYM0HjtwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAACz0lEQVRo3uWaMWgUQRSGv9nL5S57rpmAGHKdaaKFjbU2CtpYphEUCUJKsRFtFEGwTErRQiwshIgWWgVsLKKFkVQJBDXBQlGCXqmdnvcWCRo9b28tVoPZOJdbEPKqYem/827+eW/e7Ag9Htf1f0ByA7KxZ4SmI98MWCCo0kYkz2QNInQcNg8LMiGSZw1iDSxbbJxnYMnRsrpEy7QgWnfx1VQ/P13GXCo+U1Vdo1V1rdYaBql0DIaOw9bBgIwJklsNYvbLNptuTnM4KPhRjTnbNOFLaEHUbcJXmcuRPOCLrKbqukaLvCZKEMlzB4YOClJfW3wzZYdNj0v10zcF1lqN1yjVa/rBUoNo24SjMpdK7nEkD/krq6m61lqEVjQgydOCjAuSaw1STiLjmcCXpQ1KrWK1A2J4nUeADEieNEj5LBs61LB5MmDyuKTzX8R4hBkPWyWA9Mw+JY4OC1JfWzB3pSsYSJY+qy2g4BRQDRVSCQmSPGqQMhGx6e4Uy24VUi1iftQxbAG+AzdChiznBfI4EZfzBaa+QSGqWP5+GlDBXAReDRlyIGfRuJfIHZcN96eYOCGph7qMYDgBLDsb4MdDhqxtk70XjZu3pnl+UFJ3NRDBB8BeYAawwG1gLkuIC8TkX1nNzwI8AFw9EyBX46SUkl1QvGMYBK4DV4BdwDvgUhYQW4DbfyA3bxaYK7twcCU+L6WqiEgOPAZ2AwK4CDxqBTEe4ZM8aJCyZGw8PsXcCUkdKxk5DowDKvATOAM8/TdIgf8Z86pBypdiw+S0iy2dn7yKoQROAt+AAngL3Moa4twXUEu/l5Scm2H2lI1Xhv5vGRHWAJPAIaABvARuAe+zhojYfwH9bhOWwpMOHQdlHbABGAG2A58xvAHmgZdZQ+x/GwLUFDEKTABjwE5gAVPMsB+AH1lDxj4GeOorxoV2SrcfwDOuLHSXZHBrAAAAAElFTkSuQmCC") repeat`}}>
                    {/* Data do chat */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-white px-2 py-1 rounded-md text-xs text-gray-500 shadow-sm">
                        Today
                      </div>
                    </div>
                    
                    {/* Mensagem de áudio */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%] bg-[#DCF8C6] p-2 rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            {image ? (
                              <img src={image} alt="user" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex items-center space-x-2">
                            <button className="text-emerald-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </button>
                            <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full w-[60%]"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-500">0:21</span>
                          <span className="text-[10px] text-gray-500 flex items-center">
                            13:02
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M20 6L9 17l-5-5"></path></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Outro áudio (recebido) */}
                    <div className="flex mb-4">
                      <div className="max-w-[80%] bg-white p-2 rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <button className="text-gray-600 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </button>
                          <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-500 rounded-full w-[40%]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-500">0:16</span>
                          <span className="text-[10px] text-gray-500">17:53</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mensagem enviada pelo outro usuário */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%]">
                        <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm">
                          <p className="text-sm">I'm gonna grab some veggies from the store. Need anything else?</p>
                          <div className="flex justify-end items-center space-x-1">
                            <span className="text-[10px] text-gray-500">17:54</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Resposta do usuário */}
                    <div className="flex mb-2">
                      <div className="max-w-[80%] bg-white p-2 rounded-lg shadow-sm">
                        <p className="text-sm">Yeah, grab some bread</p>
                        <div className="flex justify-end items-center">
                          <span className="text-[10px] text-gray-500">17:55</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mensagem do usuário (nossa mensagem customizada) */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%]">
                        <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm">
                          <p className="text-sm">{message || 'Sure thing! Also, red onions'}</p>
                          <div className="flex justify-end items-center space-x-1">
                            <span className="text-[10px] text-gray-500">{time || '17:56'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* WhatsApp UI - Input */}
                  <div className="bg-[#F0F0F0] p-2 flex items-center space-x-2">
                    <div className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </div>
                    <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1 text-xs text-gray-500">
                      <span>It's between us...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                      <div className="h-10 w-10 bg-[#00A884] rounded-full flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M19 5.1 12 12"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {proofType === 'instagram' && (
                <div className="overflow-hidden rounded-2xl border border-gray-300 shadow-md max-w-[320px] mx-auto" style={{ maxHeight: '550px' }}>
                  {/* Barra de status do telefone iOS */}
                  <div className="bg-black text-white py-1 px-4 text-xs flex justify-between items-center">
                    <div>9:41</div>
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"></path><path d="M2 10a10 10 0 0 1 20 0"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"></path><path d="M3 14h.01"></path><path d="M7 14h.01"></path><path d="M11 14h.01"></path><path d="M15 14h.01"></path><rect width="16" height="12" x="4" y="6" rx="2"></rect></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="4" width="10" height="16" rx="1"></rect><path d="M11 5h2"></path><path d="M12 17v.01"></path></svg>
                    </div>
                  </div>
                  
                  {/* Instagram UI - Header */}
                  <div className="bg-black text-white p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
                            <div className="bg-white rounded-full h-full w-full p-[1px]">
                              {image ? (
                                <img 
                                  src={image} 
                                  alt={name} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-full h-full p-1 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-xs">{name || 'issy.lina'}</p>
                            <p className="text-[10px] text-gray-400">Online</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-4 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Instagram UI - Chat */}
                  <div className="bg-black p-3 h-[350px] overflow-y-auto space-y-4 text-white">
                    {/* Data divisor */}
                    <div className="flex justify-center">
                      <div className="text-[10px] text-gray-400 py-1">
                        Today
                      </div>
                    </div>
                    
                    {/* Mensagem de áudio (enviada) */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%] bg-[#0084FF] p-2 rounded-2xl rounded-tr-sm">
                        <div className="flex items-center space-x-2">
                          <button className="text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </button>
                          <div className="flex-1">
                            <div className="h-5 w-full">
                              <div className="h-1 bg-blue-300 rounded-full w-full relative">
                                <div className="absolute w-full h-5 -top-2">
                                  <div className="relative w-full h-full">
                                    <div className="absolute top-0 left-[20%] w-[1px] h-2 bg-blue-300"></div>
                                    <div className="absolute top-0 left-[40%] w-[1px] h-3 bg-blue-300"></div>
                                    <div className="absolute top-0 left-[60%] w-[1px] h-2 bg-blue-300"></div>
                                    <div className="absolute top-0 left-[80%] w-[1px] h-4 bg-blue-300"></div>
                                    <div className="absolute top-0 left-[90%] w-[1px] h-2 bg-blue-300"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-blue-200">0:21</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Áudio recebido */}
                    <div className="flex mb-4">
                      <div className="max-w-[80%] bg-gray-800 p-2 rounded-2xl rounded-tl-sm">
                        <div className="flex items-center space-x-2">
                          <button className="text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </button>
                          <div className="flex-1">
                            <div className="h-5 w-full">
                              <div className="h-1 bg-gray-500 rounded-full w-full relative">
                                <div className="absolute w-full h-5 -top-2">
                                  <div className="relative w-full h-full">
                                    <div className="absolute top-0 left-[20%] w-[1px] h-3 bg-gray-500"></div>
                                    <div className="absolute top-0 left-[40%] w-[1px] h-2 bg-gray-500"></div>
                                    <div className="absolute top-0 left-[50%] w-[1px] h-4 bg-gray-500"></div>
                                    <div className="absolute top-0 left-[70%] w-[1px] h-2 bg-gray-500"></div>
                                    <div className="absolute top-0 left-[90%] w-[1px] h-3 bg-gray-500"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-400">0:16</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mensagem enviada pelo usuário */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%] bg-[#0084FF] p-2 rounded-2xl rounded-tr-sm">
                        <p className="text-sm">I'm gonna grab some veggies from the store.Need anything?</p>
                      </div>
                    </div>
                    
                    {/* Resposta recebida */}
                    <div className="flex mb-2">
                      <div className="max-w-[80%] bg-gray-800 p-2 rounded-2xl rounded-tl-sm">
                        <p className="text-sm">Yeah, grab some bread</p>
                      </div>
                    </div>
                    
                    {/* Nossa mensagem customizada */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%] bg-[#0084FF] p-2 rounded-2xl rounded-tr-sm">
                        <p className="text-sm">{message || 'Sure thing! Also, red onions'}</p>
                      </div>
                    </div>
                    
                    {/* Outra mensagem enviada */}
                    <div className="flex justify-end mb-2">
                      <div className="max-w-[80%] bg-[#0084FF] p-2 rounded-2xl rounded-tr-sm">
                        <p className="text-sm">Your turn will coming))</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Instagram UI - Input */}
                  <div className="bg-black text-white p-2 border-t border-gray-800 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-800 rounded-full px-3 py-2 text-xs">
                      <span>It's between us...</span>
                    </div>
                    <div className="text-blue-500 font-medium text-xs">
                      Send
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Implementar lógica de download
                }}
                className="flex-1 bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  // Implementar lógica de cópia
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`flex-1 ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialProofGenerator; 