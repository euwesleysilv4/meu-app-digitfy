import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho conforme necessário
import { 
  X, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  Image,
  Loader
} from 'lucide-react';

const AdminChallengeForm = ({ 
  challenge, 
  isCreating, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    image_url: '',
    description: '',
    duration: '',
    difficulty: 'Iniciante',
    reward: '',
    is_active: true,
    steps: [''],
    step_details: ['']
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Carregar dados do desafio ao editar
  useEffect(() => {
    if (challenge) {
      setFormData({
        ...challenge,
        steps: challenge.steps || [''],
        step_details: challenge.step_details || ['']
      });
    }
  }, [challenge]);

  // Gerar slug a partir do título
  useEffect(() => {
    if (formData.title && !slugEdited && isCreating) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [formData.title, slugEdited, isCreating]);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'slug') {
      setSlugEdited(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo se estiver sendo editado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Atualizar uma etapa
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  // Atualizar o detalhe de uma etapa
  const handleStepDetailChange = (index, value) => {
    const newStepDetails = [...formData.step_details];
    newStepDetails[index] = value;
    
    setFormData(prev => ({
      ...prev,
      step_details: newStepDetails
    }));
  };

  // Adicionar nova etapa
  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, ''],
      step_details: [...prev.step_details, '']
    }));
  };

  // Remover uma etapa
  const removeStep = (index) => {
    if (formData.steps.length <= 1) {
      alert('O desafio deve ter pelo menos uma etapa.');
      return;
    }
    
    const newSteps = [...formData.steps];
    const newStepDetails = [...formData.step_details];
    
    newSteps.splice(index, 1);
    newStepDetails.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      steps: newSteps,
      step_details: newStepDetails
    }));
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.slug) newErrors.slug = 'O slug é obrigatório';
    if (!formData.title) newErrors.title = 'O título é obrigatório';
    if (!formData.image_url) newErrors.image_url = 'A URL da imagem é obrigatória';
    if (!formData.description) newErrors.description = 'A descrição é obrigatória';
    if (!formData.duration) newErrors.duration = 'A duração é obrigatória';
    if (!formData.difficulty) newErrors.difficulty = 'A dificuldade é obrigatória';
    if (!formData.reward) newErrors.reward = 'A recompensa é obrigatória';
    
    // Validar etapas
    const stepErrors = [];
    const stepDetailErrors = [];
    
    formData.steps.forEach((step, index) => {
      if (!step) {
        stepErrors[index] = 'O título da etapa é obrigatório';
      }
      
      if (!formData.step_details[index]) {
        stepDetailErrors[index] = 'O conteúdo da etapa é obrigatório';
      }
    });
    
    if (stepErrors.length > 0) newErrors.steps = stepErrors;
    if (stepDetailErrors.length > 0) newErrors.step_details = stepDetailErrors;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Criar novo desafio
  const createChallenge = async () => {
    try {
      setSaving(true);
      
      // Usar a função insert_complete_challenge para criar o desafio completo
      const { data, error } = await supabase.rpc('insert_complete_challenge', {
        slug: formData.slug,
        title: formData.title,
        image_url: formData.image_url,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty,
        reward: formData.reward,
        steps: formData.steps,
        step_details: formData.step_details
      });
      
      if (error) throw error;
      
      onSuccess('Desafio criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar desafio:', err);
      alert(`Erro ao criar desafio: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Atualizar desafio existente
  const updateChallenge = async () => {
    try {
      setSaving(true);
      
      // 1. Atualizar os dados básicos do desafio
      const { error: challengeError } = await supabase
        .from('challenges')
        .update({
          slug: formData.slug,
          title: formData.title,
          image_url: formData.image_url,
          description: formData.description,
          duration: formData.duration,
          difficulty: formData.difficulty,
          reward: formData.reward,
          is_active: formData.is_active
        })
        .eq('id', challenge.id);
      
      if (challengeError) throw challengeError;
      
      // 2. Excluir todas as etapas existentes
      const { error: deleteError } = await supabase
        .from('challenge_steps')
        .delete()
        .eq('challenge_id', challenge.id);
      
      if (deleteError) throw deleteError;
      
      // 3. Inserir as novas etapas
      const stepsToInsert = formData.steps.map((step, index) => ({
        challenge_id: challenge.id,
        step_order: index + 1,
        title: step,
        content: formData.step_details[index]
      }));
      
      const { error: insertError } = await supabase
        .from('challenge_steps')
        .insert(stepsToInsert);
      
      if (insertError) throw insertError;
      
      onSuccess('Desafio atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar desafio:', err);
      alert(`Erro ao atualizar desafio: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    if (isCreating) {
      await createChallenge();
    } else {
      await updateChallenge();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={saving}
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {isCreating ? 'Criar novo desafio' : 'Editar desafio'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações básicas */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Desafio*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Desafio de Aquecimento de Perfil"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (para URL)*
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: aquecimento-perfil"
                  />
                  {errors.slug ? (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Identificador único para a URL (sem espaços ou caracteres especiais)
                    </p>
                  )}
                </div>
              </div>
              
              {/* URL da imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem*
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.image_url ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {formData.image_url && (
                    <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md p-2 flex items-center">
                      <img
                        src={formData.image_url}
                        alt="Prévia"
                        className="h-8 w-8 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                {errors.image_url ? (
                  <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    URL de uma imagem de capa para o desafio
                  </p>
                )}
              </div>
              
              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descreva o desafio em poucas palavras..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Duração */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração*
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 7 dias"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
                
                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dificuldade*
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.difficulty ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
                  )}
                </div>
                
                {/* Status (ativo/inativo) */}
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 ${formData.is_active ? 'bg-blue-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
                      <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{formData.is_active ? 'Ativo' : 'Inativo'}</span>
                  </label>
                </div>
              </div>
              
              {/* Recompensa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recompensa*
                </label>
                <input
                  type="text"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reward ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Certificado de Conclusão + Material Exclusivo"
                />
                {errors.reward && (
                  <p className="mt-1 text-sm text-red-600">{errors.reward}</p>
                )}
              </div>
            </div>
            
            {/* Etapas do desafio */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  Etapas do Desafio
                </h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus size={18} className="mr-1" />
                  Adicionar Etapa
                </button>
              </div>
              
              {formData.steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      title="Remover etapa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Etapa {index + 1}*
                      </label>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.steps && errors.steps[index] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`Ex: Etapa ${index + 1}`}
                      />
                      {errors.steps && errors.steps[index] && (
                        <p className="mt-1 text-sm text-red-600">{errors.steps[index]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo Detalhado da Etapa {index + 1}*
                      </label>
                      <textarea
                        value={formData.step_details[index] || ''}
                        onChange={(e) => handleStepDetailChange(index, e.target.value)}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.step_details && errors.step_details[index] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Descreva em detalhes o que o usuário precisa fazer nesta etapa..."
                      />
                      {errors.step_details && errors.step_details[index] && (
                        <p className="mt-1 text-sm text-red-600">{errors.step_details[index]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {isCreating ? 'Criar Desafio' : 'Salvar Alterações'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChallengeForm; 