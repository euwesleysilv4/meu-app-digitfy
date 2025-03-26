import React, { useState, useEffect } from 'react';
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
  Search,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploadModal from '../components/ImageUploadModal';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

interface TestimonialImage {
  id: string;
  image_url: string;
  type: 'sale' | 'testimonial';
  name?: string;
  product?: string;
}

const AffiliateTestimonials: React.FC = () => {
  const { showToast } = useToast();
  const [testimonialImages, setTestimonialImages] = useState<TestimonialImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<TestimonialImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'sale' | 'testimonial'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const navigate = useNavigate();

  // Carregar imagens aprovadas do banco de dados
  useEffect(() => {
    fetchApprovedImages();
  }, []);

  const fetchApprovedImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonial_gallery')
        .select('id, image_url, type, name, product')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setTestimonialImages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error.message);
      showToast('Erro ao carregar imagens aprovadas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
    showToast('Imagem enviada com sucesso! Será analisada antes de aparecer na galeria.', 'success');
    // Fechar o modal
    handleCloseUploadModal();
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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
            Galeria de Depoimentos
          </h1>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('sale')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'sale' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Prints de Vendas
            </button>
            <button
              onClick={() => setFilter('testimonial')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'testimonial' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Depoimentos
            </button>
          </div>
        </motion.div>

        {/* Banner de Upload */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-800 mb-2">
              Compartilhe sua História
            </h2>
            <p className="text-emerald-700 text-sm sm:text-base">
              Tem um print de venda ou depoimento para compartilhar? 
              Envie agora e inspire outros afiliados!
            </p>
          </div>
          <button 
            onClick={handleOpenUploadModal}
            className="w-full sm:w-auto bg-emerald-500 text-white px-4 py-2 sm:py-3 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Upload className="mr-2" size={18} />
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
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-emerald-500 mb-4">
              <Upload size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma imagem encontrada</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Ainda não temos imagens aprovadas na galeria.' 
                : `Não há ${filter === 'sale' ? 'prints de vendas' : 'depoimentos'} aprovados na galeria.`}
            </p>
            <button 
              onClick={handleOpenUploadModal}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-emerald-600 transition-all"
            >
              <Upload size={16} className="mr-2" />
              Seja o primeiro a enviar
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-lg shadow-md cursor-pointer group aspect-square bg-gray-900"
              >
                <img 
                  src={image.image_url} 
                  alt={image.name || "Depoimento"} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay de ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-white p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Maximize2 size={20} />
                    </button>
                    <button
                      className="text-white p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.image_url);
                      }}
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Nome e produto */}
                {(image.name || image.product) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-8 pb-3 px-3">
                    {image.name && (
                      <p className="text-white text-sm font-medium truncate">{image.name}</p>
                    )}
                    {image.product && (
                      <p className="text-white/90 text-xs truncate">{image.product}</p>
                    )}
                  </div>
                )}
                
                {/* Indicador de tipo */}
                <div className={`
                  absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
                  ${image.type === 'sale' ? 'bg-emerald-500/90' : 'bg-blue-500/90'}
                `}>
                  {image.type === 'sale' ? 'Venda' : 'Depoimento'}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal de Imagem Ampliada */}
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4"
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
                className="absolute -top-8 sm:-top-10 right-0 text-white hover:text-gray-300 p-1"
              >
                <X size={24} className="sm:w-8 sm:h-8" />
              </button>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <img 
                  src={selectedImage?.image_url} 
                  alt={selectedImage?.name || "Depoimento"} 
                  className="w-full max-h-[80vh] object-contain"
                />
                
                {/* Info da imagem */}
                {selectedImage && (selectedImage.name || selectedImage.product) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 sm:p-4">
                    {selectedImage.name && (
                      <p className="text-white font-medium text-sm sm:text-base">{selectedImage.name}</p>
                    )}
                    {selectedImage.product && (
                      <p className="text-white/80 text-xs sm:text-sm mt-1">{selectedImage.product}</p>
                    )}
                    <div className={`
                      inline-block mt-2 px-2 py-1 rounded-full text-xs text-white
                      ${selectedImage.type === 'sale' ? 'bg-emerald-500' : 'bg-blue-500'}
                    `}>
                      {selectedImage.type === 'sale' ? 'Print de Venda' : 'Depoimento'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AffiliateTestimonials; 
 