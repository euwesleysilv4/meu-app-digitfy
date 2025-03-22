import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Camera, Link as LinkIcon } from 'lucide-react';
import ReactDOM from 'react-dom';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageData: { imageUrl: string, type: 'sale' | 'testimonial' }) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [imageType, setImageType] = useState<'sale' | 'testimonial'>('sale');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lidar com a mudança do link
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Atualizar preview se for um URL válido
    if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };
  
  // Lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) return;
    
    setIsSubmitting(true);
    
    // Enviar os dados
    onSubmit({
      imageUrl,
      type: imageType
    });
    
    // Resetar o estado do modal
    setTimeout(() => {
      setIsSubmitting(false);
      setImageUrl('');
      setPreviewUrl(null);
      setImageType('sale');
      onClose();
    }, 1000);
  };
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999]" 
        onClick={onClose}
      />
      
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl max-w-md w-full shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Upload className="text-emerald-500" size={20} />
                Enviar Imagem
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Primeiro faça upload da sua imagem no 
                <a 
                  href="https://postimages.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-semibold mx-1"
                >
                  PostImage
                </a>
                e depois cole o link direto da imagem abaixo.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="imageType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Imagem*
                </label>
                <select
                  id="imageType"
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value as 'sale' | 'testimonial')}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="sale">Print de Venda</option>
                  <option value="testimonial">Depoimento</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Link da Imagem (PostImage)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://i.postimg.cc/sua-imagem"
                    className="w-full pl-10 border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              
              {previewUrl && (
                <div className="border rounded-lg p-2 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-md object-contain"
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={!imageUrl || isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={18} />
                    Enviar Imagem
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                A imagem será analisada pela nossa equipe antes de ser publicada na galeria.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
};

export default ImageUploadModal; 