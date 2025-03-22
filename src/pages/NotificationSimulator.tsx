import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Settings, SlidersHorizontal, X, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Platform {
  name: string;
  logo: string;
}

const platforms: Platform[] = [
  {
    name: "Kirvano",
    logo: "https://kirvano.com/wp-content/uploads/2023/05/cropped-favicon-kirvano-32x32.png"
  },
  {
    name: "Cakto",
    logo: "https://cakto.com.br/favicon.ico"
  },
  {
    name: "Perfect Pay",
    logo: "https://perfectpay.com.br/favicon.ico"
  },
  {
    name: "Kiwify",
    logo: "https://dashboard.kiwify.com.br/favicon.ico"
  },
  {
    name: "Hotmart",
    logo: "https://hotmart.com/favicon.ico"
  },
  {
    name: "Eduzz",
    logo: "https://eduzz.com/favicon.ico"
  }
];

// Mantendo o fallback para garantir que sempre teremos um ícone
const getFallbackIcon = (url: string) => `https://www.google.com/s2/favicons?domain=${url}&sz=64`;

const NotificationSimulator = () => {
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [title, setTitle] = useState("Venda Aprovada no Pix");
  const [value, setValue] = useState("28,46");
  const [time, setTime] = useState("1m");
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [borderRadius, setBorderRadius] = useState(15);
  const [opacity, setOpacity] = useState(0.4);
  const notificationRef = useRef<HTMLDivElement>(null);

  const closeAlert = () => setShowAlert(false);

  const downloadNotification = async () => {
    if (notificationRef.current) {
      const canvas = await html2canvas(notificationRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "notificacao-venda.png";
      link.click();
    }
  };

  const copyNotification = async () => {
    if (notificationRef.current) {
      const canvas = await html2canvas(notificationRef.current);
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            alert("Notificação copiada!");
          } catch (err) {
            alert("Erro ao copiar. Tente fazer o download.");
          }
        }
      });
    }
  };

  return (
    <div className="relative">
      {/* Pop-up de Alerta Melhorado */}
      {showAlert && (
        <>
          {/* Overlay com blur aprimorado */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] z-50 transition-all duration-300 flex items-center justify-center"
            onClick={() => setShowAlert(false)}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl mx-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Cabeçalho do Pop-up */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 flex items-center justify-between border-b border-amber-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 rounded-lg p-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Termos de Uso do Simulador
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAlert(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Conteúdo do Pop-up */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Usos Permitidos */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <Check className="h-5 w-5 text-emerald-500" />
                        <h4 className="font-medium text-emerald-800">Usos Permitidos</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3 text-emerald-700">
                          <Check className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Criação de materiais para marketing e portfólio</span>
                        </li>
                        <li className="flex items-start space-x-3 text-emerald-700">
                          <Check className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Testes de layout e demonstrações visuais</span>
                        </li>
                        <li className="flex items-start space-x-3 text-emerald-700">
                          <Check className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Mockups e apresentações profissionais</span>
                        </li>
                      </ul>
                    </div>

                    {/* Usos Proibidos */}
                    <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium text-red-800">Usos Proibidos</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3 text-red-700">
                          <X className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Criar notificações falsas para enganar pessoas</span>
                        </li>
                        <li className="flex items-start space-x-3 text-red-700">
                          <X className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Simular resultados ou ganhos financeiros falsos</span>
                        </li>
                        <li className="flex items-start space-x-3 text-red-700">
                          <X className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">Qualquer uso que induza terceiros a erro</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Disclaimer e Botão */}
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-gray-500 text-center">
                      Ao clicar em "Aceitar e Continuar", você concorda em utilizar esta ferramenta apenas para fins legítimos e éticos.
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowAlert(false)}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 font-medium"
                      >
                        Aceitar e Continuar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      <div className="max-w-5xl mx-auto p-6">
        {/* Cabeçalho */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
            <SlidersHorizontal className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulador de Notificações</h1>
          <p className="text-gray-600">Personalize suas notificações de vendas</p>
        </motion.div>

        {/* Área principal do simulador */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Área de Configurações */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Título e Valor */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Notificação
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: Venda Aprovada no Pix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Comissão
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="ex: 1m"
                  />
                </div>
              </div>
            </div>

            {/* Plataformas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Plataforma
              </label>
              <div className="grid grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`p-4 border rounded-xl transition-all ${
                      selectedPlatform.name === platform.name
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      onError={(e) => {
                        // Se o favicon direto falhar, usa o serviço do Google
                        const target = e.target as HTMLImageElement;
                        const domain = new URL(platform.logo).hostname;
                        target.src = getFallbackIcon(domain);
                      }}
                      className="w-full h-8 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Controles de Estilo */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arredondamento ({borderRadius}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacidade ({Math.round(opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview e Ações */}
          <motion.div 
            className="flex flex-col justify-center items-center space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Container de Preview com fundo estilizado */}
            <div className="w-full max-w-sm bg-gray-100/50 backdrop-blur-sm p-8 rounded-2xl">
              <div className="flex justify-center">
                <div 
                  ref={notificationRef}
                  style={{
                    borderRadius: `${borderRadius}px`,
                    backgroundColor: `rgba(0, 0, 0, ${opacity})`
                  }}
                  className="w-[320px] overflow-hidden shadow-lg"
                >
                  <div className="flex items-start space-x-3 p-4">
                    {/* Container da Logo */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={selectedPlatform.logo}
                        alt={selectedPlatform.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const domain = new URL(selectedPlatform.logo).hostname;
                          target.src = getFallbackIcon(domain);
                        }}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 truncate">
                        {title}
                      </h3>
                      <p className="text-white text-sm">
                        Sua comissão R${value}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400 text-sm whitespace-nowrap">há {time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-4">
              <button
                onClick={downloadNotification}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
              <button
                onClick={copyNotification}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <Copy size={18} />
                <span>Copiar</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSimulator; 