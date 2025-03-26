'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Save, ExternalLink } from 'lucide-react';

type TutorialVideo = {
  id: string;
  titulo: string;
  descricao: string;
  youtube_id: string;
  categoria: 'introducao' | 'planos_premium' | 'ferramentas';
  ordem: number;
  ativo: boolean;
  data_criacao?: string;
  data_modificacao?: string;
};

type VideoFormProps = {
  video: TutorialVideo | null;
  onSave: (video: TutorialVideo) => void;
  onCancel: () => void;
};

const categoriasMap = {
  'introducao': 'Introdução à DigitFy',
  'planos_premium': 'Benefícios dos Planos Premium',
  'ferramentas': 'Ferramentas Avançadas'
};

const VideoForm: React.FC<VideoFormProps> = ({ video, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TutorialVideo>(
    video || {
      id: '',
      titulo: '',
      descricao: '',
      youtube_id: '',
      categoria: 'introducao',
      ordem: 1,
      ativo: true
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    formData.youtube_id ? `https://img.youtube.com/vi/${formData.youtube_id}/maxresdefault.jpg` : null
  );

  // Manipular alterações nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limpar o erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name === 'youtube_id') {
      // Extrair o ID do YouTube se o usuário colar uma URL completa
      let youtubeId = value;
      const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = value.match(urlPattern);
      
      if (match && match[1]) {
        youtubeId = match[1];
      }
      
      setFormData(prev => ({
        ...prev,
        youtube_id: youtubeId
      }));
      
      // Atualizar a URL de preview
      if (youtubeId.length === 11) {
        setPreviewUrl(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
      } else {
        setPreviewUrl(null);
      }
    } else if (name === 'ordem') {
      // Garantir que a ordem seja um número inteiro positivo
      const numeroOrdem = parseInt(value, 10);
      if (!isNaN(numeroOrdem) && numeroOrdem > 0) {
        setFormData(prev => ({
          ...prev,
          ordem: numeroOrdem
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Verificar se a URL do YouTube está correta
  const testarUrlYoutube = () => {
    if (formData.youtube_id) {
      window.open(`https://www.youtube.com/watch?v=${formData.youtube_id}`, '_blank');
    }
  };

  // Validar o formulário antes de salvar
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      novosErros.titulo = 'O título é obrigatório';
    }
    
    if (!formData.descricao.trim()) {
      novosErros.descricao = 'A descrição é obrigatória';
    }
    
    if (!formData.youtube_id.trim()) {
      novosErros.youtube_id = 'O ID do YouTube é obrigatório';
    } else if (formData.youtube_id.length !== 11) {
      novosErros.youtube_id = 'O ID do YouTube deve ter 11 caracteres';
    }
    
    if (!formData.categoria) {
      novosErros.categoria = 'A categoria é obrigatória';
    }
    
    if (!formData.ordem || formData.ordem < 1) {
      novosErros.ordem = 'A ordem deve ser um número positivo';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Manipular o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {video ? 'Editar Vídeo Tutorial' : 'Adicionar Novo Vídeo Tutorial'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              maxLength={100}
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>
          
          {/* Descrição */}
          <div className="mb-4">
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              rows={3}
              maxLength={255}
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.descricao}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.descricao.length}/255 caracteres
            </p>
          </div>
          
          {/* ID do YouTube */}
          <div className="mb-4">
            <label htmlFor="youtube_id" className="block text-sm font-medium text-gray-700 mb-1">
              ID do YouTube <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="youtube_id"
                name="youtube_id"
                value={formData.youtube_id}
                onChange={handleChange}
                className={`flex-grow px-3 py-2 border ${
                  errors.youtube_id ? 'border-red-500' : 'border-gray-300'
                } rounded-l-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Ex: dQw4w9WgXcQ"
                maxLength={11}
              />
              <button
                type="button"
                onClick={testarUrlYoutube}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-md flex items-center"
                disabled={!formData.youtube_id}
              >
                <ExternalLink size={18} className="mr-1" />
                Testar
              </button>
            </div>
            {errors.youtube_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.youtube_id}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Cole o ID do YouTube (11 caracteres) ou a URL completa do vídeo
            </p>
          </div>
          
          {/* Preview do vídeo */}
          {previewUrl && (
            <div className="mb-4 border p-2 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview da miniatura:</p>
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview do vídeo" 
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              </div>
            </div>
          )}
          
          {/* Categoria */}
          <div className="mb-4">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.categoria ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
            >
              <option value="introducao">Introdução à DigitFy</option>
              <option value="planos_premium">Benefícios dos Planos Premium</option>
              <option value="ferramentas">Ferramentas Avançadas</option>
            </select>
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.categoria}
              </p>
            )}
          </div>
          
          {/* Ordem */}
          <div className="mb-4">
            <label htmlFor="ordem" className="block text-sm font-medium text-gray-700 mb-1">
              Ordem de exibição <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="ordem"
              name="ordem"
              value={formData.ordem}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.ordem ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              min="1"
              step="1"
            />
            {errors.ordem && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.ordem}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Ordem de exibição dentro da categoria (menor número = aparece primeiro)
            </p>
          </div>
          
          {/* Status (apenas para edição) */}
          {video && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Vídeo ativo (visível para os usuários)</span>
              </label>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Save size={18} className="mr-2" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoForm; 