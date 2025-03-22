import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Download, Palette, Sparkles, Layout, Type, MessageCircle } from 'lucide-react';

const CustomCreatives = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    { 
      id: 'square', 
      name: 'Post Feed Quadrado', 
      icon: Layout,
      dimensions: '1080 x 1080px'
    },
    { 
      id: 'rectangle', 
      name: 'Post Feed Retangular', 
      icon: Layout,
      dimensions: '1350 x 1080px'
    },
    { 
      id: 'story', 
      name: 'Post Story', 
      icon: Layout,
      dimensions: '1920 x 1080px'
    }
  ];

  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#800080'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    // Lógica para baixar o criativo
    alert('Criativo baixado com sucesso!');
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cabeçalho */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
          <Palette className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Criativos Personalizados
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Escolha o formato ideal para sua publicação e personalize seu design com facilidade.
        </p>
      </motion.div>

      {/* Grid de Templates */}
      {!customizing && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {templates.map((template) => (
            <motion.div
              key={template.id}
              className={`
                relative bg-white rounded-xl shadow-lg p-6 cursor-pointer
                hover:shadow-xl transition-all duration-300
                ${selectedTemplate === template.id ? 'ring-2 ring-emerald-500' : ''}
              `}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-emerald-50 rounded-full">
                  <template.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-600 text-center">
                  {template.dimensions}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Seção de Dicas */}
      {!customizing && (
        <motion.div 
          className="mt-12 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Dicas para Criativos Atraentes
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Dica 1 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Type className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Tipografia</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use fontes claras e legíveis. Combine no máximo 2 fontes diferentes para manter a harmonia.
              </p>
            </motion.div>

            {/* Dica 2 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Palette className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Cores</h4>
              </div>
              <p className="text-sm text-gray-600">
                Escolha uma paleta de cores que combine com sua marca. Use cores contrastantes para destacar elementos importantes.
              </p>
            </motion.div>

            {/* Dica 3 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Image className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Imagens</h4>
              </div>
              <p className="text-sm text-gray-600">
                Utilize imagens de alta qualidade e relevantes para o conteúdo. Evite sobrecarregar o design com muitas imagens.
              </p>
            </motion.div>

            {/* Dica 4 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Layout className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Composição</h4>
              </div>
              <p className="text-sm text-gray-600">
                Mantenha o layout organizado e equilibrado. Use o espaço em branco para dar respiro ao design.
              </p>
            </motion.div>

            {/* Dica 5 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Originalidade</h4>
              </div>
              <p className="text-sm text-gray-600">
                Crie designs únicos que reflitam a personalidade da sua marca. Evite cópias de outros criativos.
              </p>
            </motion.div>

            {/* Dica 6 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-800">Mensagem</h4>
              </div>
              <p className="text-sm text-gray-600">
                Mantenha a mensagem clara e objetiva. Use chamadas para ação que incentivem o engajamento.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Área de Personalização */}
      {selectedTemplate && !customizing && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={() => setCustomizing(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5" />
            <span>Começar a Personalizar</span>
          </motion.button>
        </motion.div>
      )}

      {/* Editor de Personalização */}
      {customizing && (
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Área de Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
            <div className={`
              relative aspect-[${selectedTemplate === 'story' ? '9/16' : 
              selectedTemplate === 'rectangle' ? '1350/1080' : '1/1'}] 
              bg-gray-100 rounded-lg overflow-hidden
            `}>
              {uploadedImage ? (
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Preview do seu design</p>
                </div>
              )}
              <div 
                className="absolute inset-0 p-4 flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                <p className="text-white text-center">{textContent}</p>
              </div>
            </div>
          </div>

          {/* Área de Configurações */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personalização</h3>
            
            {/* Upload de Imagem */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem Principal
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {uploadedImage ? (
                  <div className="relative w-full aspect-video">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Seleção de Cores */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-emerald-500' : 'border-white'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Edição de Texto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto
              </label>
              <input
                type="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-4">
              <motion.button
                className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!uploadedImage}
              >
                <Download className="w-5 h-5" />
                <span>Baixar</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  setCustomizing(false);
                  setSelectedTemplate(null);
                  setUploadedImage(null);
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Cancelar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomCreatives; 