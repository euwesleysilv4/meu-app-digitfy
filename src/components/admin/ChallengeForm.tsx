import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  Image,
  Loader
} from 'lucide-react';

// Defina a interface do desafio com base nas tabelas do banco de dados
interface Challenge {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  reward: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: string[];
  step_details: string[];
}

interface ChallengeFormProps {
  challenge: Challenge | null;
  isEditing: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  challenge,
  isEditing,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Omit<Challenge, 'id' | 'created_at' | 'updated_at'>>({
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
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Carregar dados do desafio para edição
  useEffect(() => {
    if (challenge && isEditing) {
      setFormData({
        slug: challenge.slug,
        title: challenge.title,
        image_url: challenge.image_url,
        description: challenge.description,
        duration: challenge.duration,
        difficulty: challenge.difficulty,
        reward: challenge.reward,
        is_active: challenge.is_active,
        steps: [...challenge.steps],
        step_details: [...challenge.step_details]
      });
    }
  }, [challenge, isEditing]);

  // Gerar slug automaticamente a partir do título (apenas em criação)
  useEffect(() => {
    if (formData.title && !slugEdited && !isEditing) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [formData.title, slugEdited, isEditing]);

  // Handler para campos de texto simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'slug') {
      setSlugEdited(true);
    }
    
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handler para o checkbox de status
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  // Handler para etapas
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
    
    // Limpar erro do campo
    if (errors.steps && Array.isArray(errors.steps) && errors.steps[index]) {
      const newStepErrors = [...errors.steps];
      newStepErrors[index] = '';
      
      setErrors(prev => ({
        ...prev,
        steps: newStepErrors
      }));
    }
  };

  // Handler para detalhes das etapas
  const handleStepDetailChange = (index: number, value: string) => {
    const newStepDetails = [...formData.step_details];
    newStepDetails[index] = value;
    
    setFormData(prev => ({
      ...prev,
      step_details: newStepDetails
    }));
    
    // Limpar erro do campo
    if (errors.step_details && Array.isArray(errors.step_details) && errors.step_details[index]) {
      const newStepDetailErrors = [...errors.step_details];
      newStepDetailErrors[index] = '';
      
      setErrors(prev => ({
        ...prev,
        step_details: newStepDetailErrors
      }));
    }
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
  const removeStep = (index: number) => {
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

  // Validar o formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};
    
    // Validar campos obrigatórios
    if (!formData.slug) newErrors.slug = 'Slug é obrigatório';
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.image_url) newErrors.image_url = 'URL da imagem é obrigatória';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    if (!formData.duration) newErrors.duration = 'Duração é obrigatória';
    if (!formData.difficulty) newErrors.difficulty = 'Dificuldade é obrigatória';
    if (!formData.reward) newErrors.reward = 'Recompensa é obrigatória';
    
    // Validar etapas
    const stepErrors: string[] = [];
    const stepDetailErrors: string[] = [];
    let hasStepErrors = false;
    
    formData.steps.forEach((step, index) => {
      if (!step) {
        stepErrors[index] = 'Nome da etapa é obrigatório';
        hasStepErrors = true;
      } else {
        stepErrors[index] = '';
      }
      
      if (!formData.step_details[index]) {
        stepDetailErrors[index] = 'Detalhes da etapa são obrigatórios';
        hasStepErrors = true;
      } else {
        stepDetailErrors[index] = '';
      }
    });
    
    if (hasStepErrors) {
      newErrors.steps = stepErrors;
      newErrors.step_details = stepDetailErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Criar um novo desafio
  const createChallenge = async () => {
    try {
      setIsSubmitting(true);
      
      // Usar a função RPC para inserir o desafio completo
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
      
      if (error) {
        console.error('Erro ao criar desafio:', error);
        
        // Solução para o erro de permissão
        if (error.message && error.message.includes('permission denied')) {
          alert(`Erro de permissão ao criar desafio: ${error.message}. Este problema ocorre quando as políticas de RLS (Row Level Security) no Supabase não estão configuradas corretamente para permitir inserções. Verifique as políticas RLS da tabela challenges e challenge_steps.`);
          return false;
        }
        
        alert(`Erro ao criar desafio: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao criar desafio:', error);
      alert(`Erro ao criar desafio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualizar um desafio existente
  const updateChallenge = async () => {
    if (!challenge) return false;
    
    try {
      setIsSubmitting(true);
      
      // 1. Atualizar os dados básicos do desafio
      const { error: updateError } = await supabase
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
      
      if (updateError) {
        console.error('Erro ao atualizar desafio:', updateError);
        
        // Solução para o erro de permissão
        if (updateError.message && updateError.message.includes('permission denied')) {
          alert(`Erro de permissão ao atualizar desafio: ${updateError.message}. Verifique as políticas de RLS da tabela challenges.`);
          return false;
        }
        
        alert(`Erro ao atualizar desafio: ${updateError.message}`);
        return false;
      }
      
      // 2. Excluir todas as etapas do desafio
      const { error: deleteError } = await supabase
        .from('challenge_steps')
        .delete()
        .eq('challenge_id', challenge.id);
      
      if (deleteError) {
        console.error('Erro ao excluir etapas:', deleteError);
        
        // Solução para o erro de permissão
        if (deleteError.message && deleteError.message.includes('permission denied')) {
          alert(`Erro de permissão ao excluir etapas: ${deleteError.message}. Verifique as políticas de RLS da tabela challenge_steps.`);
          return false;
        }
        
        alert(`Erro ao atualizar etapas: ${deleteError.message}`);
        return false;
      }
      
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
      
      if (insertError) {
        console.error('Erro ao inserir novas etapas:', insertError);
        
        // Solução para o erro de permissão
        if (insertError.message && insertError.message.includes('permission denied')) {
          alert(`Erro de permissão ao inserir etapas: ${insertError.message}. Verifique as políticas de RLS da tabela challenge_steps.`);
          return false;
        }
        
        alert(`Erro ao atualizar etapas: ${insertError.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar desafio:', error);
      alert(`Erro ao atualizar desafio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para o submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    let success = false;
    
    if (isEditing) {
      success = await updateChallenge();
      if (success) {
        onSuccess('Desafio atualizado com sucesso!');
      }
    } else {
      success = await createChallenge();
      if (success) {
        onSuccess('Desafio criado com sucesso!');
      }
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
              disabled={isSubmitting}
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Editar Desafio' : 'Criar Novo Desafio'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: aquecimento-perfil"
                  />
                  {errors.slug ? (
                    <p className="mt-1 text-sm text-red-600">{errors.slug as string}</p>
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
                    className={`w-full px-3 py-2 border rounded-l-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
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
                  <p className="mt-1 text-sm text-red-600">{errors.image_url as string}</p>
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descreva o desafio em poucas palavras..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description as string}</p>
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 7 dias"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration as string}</p>
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.difficulty ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">{errors.difficulty as string}</p>
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
                        onChange={handleStatusChange}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.reward ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Certificado de Conclusão + Material Exclusivo"
                />
                {errors.reward && (
                  <p className="mt-1 text-sm text-red-600">{errors.reward as string}</p>
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
                  className="flex items-center text-emerald-600 hover:text-emerald-800"
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
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.steps && Array.isArray(errors.steps) && errors.steps[index] 
                            ? 'border-red-300' 
                            : 'border-gray-300'
                        }`}
                        placeholder={`Ex: Etapa ${index + 1}`}
                      />
                      {errors.steps && Array.isArray(errors.steps) && errors.steps[index] && (
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
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.step_details && Array.isArray(errors.step_details) && errors.step_details[index] 
                            ? 'border-red-300' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Descreva em detalhes o que o usuário precisa fazer nesta etapa..."
                      />
                      {errors.step_details && Array.isArray(errors.step_details) && errors.step_details[index] && (
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
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Criar Desafio'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm; 