import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Maximize2, 
  X,
  Upload,
  Filter,
  User,
  Plus,
  Check,
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploadModal from '../components/ImageUploadModal';

interface TestimonialImage {
  id: string;
  url: string;
  type: 'sale' | 'testimonial';
}

const testimonialImages: TestimonialImage[] = [
  { 
    id: 'img-1', 
    url: 'https://exemplo.com/imagem1.jpg',
    type: 'sale'
  },
  { 
    id: 'img-2', 
    url: 'https://exemplo.com/imagem2.jpg',
    type: 'testimonial'
  },
  { id: 'img-3', url: 'https://exemplo.com/imagem3.jpg', type: 'sale' },
  { id: 'img-4', url: 'https://exemplo.com/imagem4.jpg', type: 'testimonial' },
  { id: 'img-5', url: 'https://exemplo.com/imagem5.jpg', type: 'sale' },
  { id: 'img-6', url: 'https://exemplo.com/imagem6.jpg', type: 'testimonial' },
  { id: 'img-7', url: 'https://exemplo.com/imagem7.jpg', type: 'sale' },
  { id: 'img-8', url: 'https://exemplo.com/imagem8.jpg', type: 'testimonial' },
  { id: 'img-9', url: 'https://exemplo.com/imagem9.jpg', type: 'sale' },
  { id: 'img-10', url: 'https://exemplo.com/imagem10.jpg', type: 'testimonial' },
  { id: 'img-11', url: 'https://exemplo.com/imagem11.jpg', type: 'sale' },
  { id: 'img-12', url: 'https://exemplo.com/imagem12.jpg', type: 'testimonial' },
];

const AffiliateTestimonials: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<TestimonialImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'sale' | 'testimonial'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const navigate = useNavigate();

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imagem_depoimento.jpg';
    link.click();
  };

  const handleOpenAffiliateModal = () => {
    setShowAffiliateModal(true);
  };

  const handleCloseAffiliateModal = () => {
    setShowAffiliateModal(false);
  };

  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleImageUpload = (imageData: { imageUrl: string, type: 'sale' | 'testimonial' }) => {
    // Aqui você implementaria o envio do link da imagem para o servidor
    console.log('Link da imagem enviado:', imageData);
    
    // Simular sucesso no envio
    alert('Link da imagem enviado com sucesso! Será analisada antes de aparecer na galeria.');
  };

  const filteredImages = filter === 'all' 
    ? testimonialImages 
    : testimonialImages.filter(img => img.type === filter);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="container mx-auto">
        {/* Cabeçalho com Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Galeria de Depoimentos
          </h1>

          {/* Filtros */}
          <div className="flex space-x-2 items-center">
            <Filter className="text-gray-500 mr-2" />
            <button 
              onClick={() => setFilter('all')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${filter === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('sale')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${filter === 'sale' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Vendas
            </button>
            <button 
              onClick={() => setFilter('testimonial')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${filter === 'testimonial' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Depoimentos
            </button>
          </div>
        </motion.div>

        {/* Banner de Envio de Imagem */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-xl font-bold text-emerald-800 mb-2">
              Compartilhe sua História
            </h2>
            <p className="text-emerald-700">
              Tem um print de venda ou depoimento para compartilhar? 
              Envie agora e inspire outros afiliados!
            </p>
          </div>
          <button 
            onClick={handleOpenUploadModal}
            className="w-full md:w-auto bg-emerald-500 text-white px-4 py-3 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 hover:scale-105"
          >
            <Upload className="mr-2" size={20} />
            <span>Enviar Imagem</span>
          </button>
        </motion.div>

        {/* Modal de Upload de Imagem */}
        <ImageUploadModal
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          onSubmit={handleImageUpload}
        />

        {/* Galeria de Imagens */}
        <motion.div 
          className="grid grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              whileHover={{ scale: 1.05 }}
              className="relative overflow-hidden rounded-lg shadow-md cursor-pointer group aspect-square"
            >
              <img 
                src={image.url} 
                alt="Depoimento" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay de ações */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 
                    className="text-white" 
                    onClick={() => setSelectedImage(image)}
                  />
                  <Download 
                    className="text-white" 
                    onClick={() => handleDownload(image.url)}
                  />
                </div>
              </div>
              {/* Indicador de tipo */}
              <div className={`
                absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs text-white
                ${image.type === 'sale' ? 'bg-emerald-500' : 'bg-blue-500'}
              `}>
                {image.type === 'sale' ? 'Venda' : 'Depoimento'}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal de Imagem Ampliada */}
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-4xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X size={32} />
              </button>

              <img 
                src={selectedImage.url} 
                alt="Imagem ampliada" 
                className="w-full max-h-[90vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AffiliateTestimonials; 
 