import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, SlidersHorizontal, X, AlertTriangle, Check, AlertCircle } from 'lucide-react';

// Modificando para ter apenas a opção de imagem personalizada
const platforms = [
  {
    name: "Imagem Personalizada",
    logo: ""
  }
];

// Garantir um ícone de fallback quando o original não carregar
const getFallbackIcon = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
  } catch {
    // Fallback seguro local caso o serviço do Google falhe
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXN0b3JlIj48cGF0aCBkPSJNMiAzaDIwdjhjMCA0LjQxOC0zLjU4MiA4LTggOEg0YTIgMiAwIDAgMS0yLTJWM1oiLz48cGF0aCBkPSJNMTYgMTh2MmE0IDQgMCAwIDEtOCAwdi0yIi8+PHBhdGggZD0iTTQgMTVoMTYiLz48cGF0aCBkPSJNMiAzaDIwIi8+PC9zdmc+';
  }
};

// Renderizar notificação mesmo sem imagem
const createEmptyImage = (): HTMLImageElement => {
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXN0b3JlIj48cGF0aCBkPSJNMiAzaDIwdjhjMCA0LjQxOC0zLjU4MiA4LTggOEg0YTIgMiAwIDAgMS0yLTJWM1oiLz48cGF0aCBkPSJNMTYgMTh2MmE0IDQgMCAwIDEtOCAwdi0yIi8+PHBhdGggZD0iTTQgMTVoMTYiLz48cGF0aCBkPSJNMiAzaDIwIi8+PC9zdmc+';
  return img;
};

const NotificationSimulator = () => {
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [title, setTitle] = useState("Venda Aprovada no Pix");
  const [value, setValue] = useState("28,46");
  const [time, setTime] = useState("1m");
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [borderRadius, setBorderRadius] = useState(13);
  const [opacity, setOpacity] = useState(0.9);
  const [titleHeight, setTitleHeight] = useState(12);
  const [valueHeight, setValueHeight] = useState(21);
  const [fontSize, setFontSize] = useState(18);
  const [iconSize, setIconSize] = useState(57);
  const [notificationWidth, setNotificationWidth] = useState(370);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [platformImage, setPlatformImage] = useState<HTMLImageElement | null>(createEmptyImage());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Força uma renderização inicial
  useEffect(() => {
    if (canvasRef.current) {
      setTimeout(() => {
        renderNotification();
      }, 100);
    }
  }, [canvasRef.current]);

  // Função para lidar com o upload de imagem personalizada
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Atualizar a imagem personalizada
      setCustomImage(dataUrl);
      
      // Atualizar a plataforma selecionada com a imagem personalizada
      setSelectedPlatform({...platforms[0], logo: dataUrl});
    };
    
    reader.readAsDataURL(file);
  };

  // Função para carregar a imagem da plataforma
  useEffect(() => {
    const loadPlatformImage = async () => {
      // Sempre iniciar com uma imagem vazia para garantir que o render aconteça
      setPlatformImage(createEmptyImage());
      
      // Se for imagem personalizada e temos o dataURL, usar diretamente
      if (selectedPlatform.name === "Imagem Personalizada" && customImage) {
        try {
          const img = new Image();
          img.onload = () => setPlatformImage(img);
          img.src = customImage;
        } catch (error) {
          console.error("Erro ao carregar imagem personalizada:", error);
          setPlatformImage(createEmptyImage());
        }
        return;
      }
      
      // Para plataformas normais, tentar carregar com segurança
      try {
        // Tentativa de carregar e converter a imagem em um Data URL seguro
        const secureImg = await convertImageToSecureDataUrl(selectedPlatform.logo);
        setPlatformImage(secureImg);
      } catch (error) {
        console.error("Erro ao carregar imagem segura:", error);
        
        try {
          // Tentar com fallback do Google
          const domain = new URL(selectedPlatform.logo).hostname;
          const fallbackUrl = getFallbackIcon(domain);
          const fallbackImg = await convertImageToSecureDataUrl(fallbackUrl);
          setPlatformImage(fallbackImg);
        } catch (fallbackError) {
          console.error("Não foi possível carregar o fallback:", fallbackError);
          // Usar a imagem vazia como último recurso
          setPlatformImage(createEmptyImage());
        }
      }
    };
    
    loadPlatformImage();
  }, [selectedPlatform, customImage]);

  // Função para converter qualquer imagem em um Data URL seguro
  const convertImageToSecureDataUrl = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Criar uma nova imagem e um canvas temporário
      const img = new Image();
      img.crossOrigin = "anonymous"; // Crucial para evitar taint no canvas
      
      img.onload = () => {
        try {
          // Criar um canvas temporário para converter a imagem
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          
          if (!tempCtx) {
            reject(new Error("Não foi possível criar contexto de canvas"));
            return;
          }
          
          // Definir tamanho do canvas para a imagem
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          
          // Desenhar a imagem no canvas
          tempCtx.drawImage(img, 0, 0);
          
          // Converter para Data URL (isso evita problemas de CORS)
          const dataUrl = tempCanvas.toDataURL('image/png');
          
          // Criar nova imagem com o Data URL
          const secureImg = new Image();
          secureImg.onload = () => resolve(secureImg);
          secureImg.onerror = () => reject(new Error("Erro ao carregar dataURL"));
          secureImg.src = dataUrl;
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error(`Não foi possível carregar a imagem: ${url}`));
      };
      
      // Iniciar o carregamento
      img.src = url;
      
      // Para imagens em cache
      if (img.complete || img.complete === undefined) {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        img.src = url;
      }
    });
  };

  // Função de renderização da notificação
  const renderNotification = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Configurar o tamanho do canvas - ajustado para corresponder à imagem de exemplo
      const scale = 3; // Para maior qualidade
      const width = notificationWidth * scale; // Usando a largura configurável
      const height = 80 * scale; // Mantendo a altura fixa
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${notificationWidth}px`; // Usando a largura configurável
      canvas.style.height = '80px'; // Mantendo a altura fixa
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Limpar o canvas
      ctx.clearRect(0, 0, width, height);
      
      // Configurações para alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Desenhar o fundo com bordas arredondadas
      ctx.save();
      
      // Criar caminho para o recorte com bordas arredondadas
      const radiusScale = borderRadius * scale;
      ctx.beginPath();
      
      // Usar roundRect se disponível, ou desenhar manualmente
      try {
        ctx.roundRect(0, 0, width, height, radiusScale);
      } catch (error) {
        // Fallback para navegadores que não suportam roundRect
        ctx.moveTo(radiusScale, 0);
        ctx.lineTo(width - radiusScale, 0);
        ctx.quadraticCurveTo(width, 0, width, radiusScale);
        ctx.lineTo(width, height - radiusScale);
        ctx.quadraticCurveTo(width, height, width - radiusScale, height);
        ctx.lineTo(radiusScale, height);
        ctx.quadraticCurveTo(0, height, 0, height - radiusScale);
        ctx.lineTo(0, radiusScale);
        ctx.quadraticCurveTo(0, 0, radiusScale, 0);
        ctx.closePath();
      }
      
      // Aplicar o recorte
      ctx.clip();
      
      // Desenhar o fundo com a opacidade correta
      // Usando RGBA diretamente com a opacidade definida pelo usuário
      const alpha = Number(opacity.toFixed(2)); // Fixar para 2 casas decimais para evitar problemas de precisão
      ctx.fillStyle = `rgba(68, 68, 68, 1)`; // Fundo base sólido
      ctx.fillRect(0, 0, width, height);
      
      // Sobrepor com uma camada branca semi-transparente para ajustar a opacidade geral
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - alpha})`; // Inverte a opacidade para o efeito correto
      ctx.fillRect(0, 0, width, height);
      
      ctx.restore(); // Restaurar o contexto antes de desenhar os elementos do conteúdo
      
      // Definir dimensões e posição do ícone
      const iconSizeScaled = iconSize * scale; // Usando o tamanho configurável
      const iconX = 16 * scale;
      const iconY = (height - iconSizeScaled) / 2;
      
      // Desenhar o logo diretamente sem o container branco
      if (platformImage) {
        try {
          // Ajustando para que a imagem ocupe o espaço disponível
          const imgSize = iconSizeScaled; // Usar o tamanho total do ícone
          const imgX = iconX;
          const imgY = iconY;
          
          // Aplicar recorte circular/arredondado à imagem da plataforma
          ctx.save();
          ctx.beginPath();
          
          // O raio do recorte deve ser igual ao usado antes
          const clipRadius = Math.min(10, iconSize/4) * scale;
          
          try {
            // Criando um recorte arredondado para a imagem
            ctx.roundRect(imgX, imgY, imgSize, imgSize, clipRadius);
          } catch (error) {
            // Fallback para navegadores que não suportam roundRect
            ctx.moveTo(imgX + clipRadius, imgY);
            ctx.lineTo(imgX + imgSize - clipRadius, imgY);
            ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + clipRadius);
            ctx.lineTo(imgX + imgSize, imgY + imgSize - clipRadius);
            ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - clipRadius, imgY + imgSize);
            ctx.lineTo(imgX + clipRadius, imgY + imgSize);
            ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - clipRadius);
            ctx.lineTo(imgX, imgY + clipRadius);
            ctx.quadraticCurveTo(imgX, imgY, imgX + clipRadius, imgY);
            ctx.closePath();
          }
          
          ctx.clip();
          ctx.drawImage(platformImage, imgX, imgY, imgSize, imgSize);
          ctx.restore();
        } catch (error) {
          console.error("Erro ao desenhar imagem:", error);
        }
      }
      
      // Desenhar o título
      const textX = iconX + iconSizeScaled + (12 * scale); // Espaço após o ícone
      const titleY = iconY + (titleHeight * scale); // Usando a altura específica do título
      
      ctx.font = `bold ${fontSize * scale}px sans-serif`; // Usando o tamanho configurável
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'top';
      ctx.fillText(title, textX, titleY);
      
      // Desenhar o valor da comissão
      const valueY = titleY + (valueHeight * scale); // Usando a altura específica do valor
      ctx.font = `${(fontSize - 2) * scale}px sans-serif`; // 2px menor que o tamanho do título
      ctx.fillText(`Sua comissão R$${value}`, textX, valueY);
      
      // Desenhar o tempo
      const timeText = `há ${time}`;
      ctx.font = `${(fontSize - 2) * scale}px sans-serif`; // 2px menor que o tamanho do título
      ctx.fillStyle = '#9CA3AF';
      
      // Medir o texto para posicioná-lo à direita
      const timeWidth = ctx.measureText(timeText).width;
      const timeX = width - timeWidth - (16 * scale); // Margem da direita
      const timeY = titleY;
      
      ctx.fillText(timeText, timeX, timeY);
      
      // Salvar a imagem como URL de dados
      setPreviewImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error("Erro ao renderizar notificação:", error);
      
      // Mesmo com erro, tentar criar uma imagem básica
      try {
        const canvas = document.createElement('canvas');
        canvas.width = notificationWidth; // Usando a largura configurável
        canvas.height = 80; // Mantendo a altura fixa
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Aplicar a opacidade corretamente no fallback
          const alpha = Number(opacity.toFixed(2));
          ctx.fillStyle = `rgba(68, 68, 68, ${alpha})`; // Usando o valor direto da opacidade
          ctx.fillRect(0, 0, notificationWidth, 80); // Usando a largura configurável
          ctx.font = `bold ${fontSize}px sans-serif`; // Usando o tamanho configurável
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(title, 70, 30); // Ajustado para novas proporções
          ctx.font = `${fontSize - 2}px sans-serif`; // 2px menor que o tamanho do título
          ctx.fillText(`Sua comissão R$${value}`, 70, 50); // Ajustado para novas proporções
          setPreviewImage(canvas.toDataURL('image/png'));
        }
      } catch (fallbackError) {
        console.error("Erro ao criar imagem básica:", fallbackError);
      }
    }
  };

  // Renderizar a notificação no canvas quando os parâmetros mudarem
  useEffect(() => {
    if (!canvasRef.current) return;
    renderNotification();
  }, [title, value, time, selectedPlatform, borderRadius, opacity, titleHeight, valueHeight, fontSize, iconSize, notificationWidth, platformImage]);

  // Função de fechamento do alerta
  const closeAlert = () => setShowAlert(false);

  // Função para fazer download da notificação
  const downloadNotification = () => {
    if (!previewImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = 'notificacao-venda.png';
      link.click();
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao gerar imagem. Por favor, tente novamente.');
    }
  };

  // Função para copiar a notificação para a área de transferência
  const copyNotification = async () => {
    if (!previewImage) return;
    
    try {
      // Converter data URL para Blob
      const fetchResponse = await fetch(previewImage);
      const blob = await fetchResponse.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      alert('Notificação copiada!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar. Tente fazer o download.');
    }
  };

  return (
    <div className="relative">
      {/* Pop-up de Alerta Melhorado */}
      {showAlert && (
        <>
          {/* Overlay com blur aprimorado */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] z-50 transition-all duration-300 flex items-center justify-center p-4"
            onClick={() => setShowAlert(false)}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg mx-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Cabeçalho do Pop-up */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-amber-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 rounded-lg p-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
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
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
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

            {/* Área de imagem personalizada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagem da Plataforma
              </label>
              
              {/* Container para a imagem selecionada */}
              <div className="mb-4 flex justify-center">
                <div className={`w-24 h-24 rounded-xl border-2 flex items-center justify-center ${customImage ? 'border-emerald-500' : 'border-gray-300 border-dashed'}`}>
                  {customImage ? (
                    <img src={customImage} alt="Imagem personalizada" className="h-20 w-20 object-contain rounded" />
                  ) : (
                    <span className="text-sm text-gray-500 text-center px-2">Nenhuma imagem selecionada</span>
                  )}
                </div>
              </div>
              
              {/* Botão de upload de imagem personalizada */}
              <div>
                <label 
                  htmlFor="image-upload" 
                  className="block w-full cursor-pointer py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-center text-sm font-medium text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                >
                  {customImage ? 'Trocar imagem personalizada' : 'Carregar imagem personalizada'}
                </label>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                {customImage && (
                  <div className="mt-2 text-xs text-emerald-600 text-center">
                    Imagem carregada com sucesso!
                  </div>
                )}
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
              
              {/* Novos controles */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura do título ({titleHeight}px)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="25"
                    value={titleHeight}
                    onChange={(e) => setTitleHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura do valor ({valueHeight}px)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="25"
                    value={valueHeight}
                    onChange={(e) => setValueHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho da fonte ({fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho do ícone ({iconSize}px)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura ({notificationWidth}px)
                  </label>
                  <input
                    type="range"
                    min="320"
                    max="500"
                    step="10"
                    value={notificationWidth}
                    onChange={(e) => setNotificationWidth(Number(e.target.value))}
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
            <div className="w-full flex justify-center items-center p-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl shadow-inner">
              <div className="relative w-full" style={{ maxWidth: `${notificationWidth}px` }}>
                {/* Canvas invisível que gera a imagem */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Imagem do preview */}
                {previewImage && (
                  <img 
                    src={previewImage} 
                    alt="Preview da notificação" 
                    className="w-full rounded-[15px] shadow-lg" 
                  />
                )}
                
                {/* Fallback enquanto a imagem não carrega */}
                {!previewImage && (
                  <div className="w-full h-[80px] bg-gray-200 rounded-xl animate-pulse shadow-md"></div>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-4">
              <button
                onClick={downloadNotification}
                disabled={!previewImage}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-emerald-500"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
              <button
                onClick={copyNotification}
                disabled={!previewImage}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
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