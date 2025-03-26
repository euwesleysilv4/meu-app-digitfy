import React, { useEffect, useState } from 'react';
import { novidadesService } from '../../services/novidadesService';
import { Novidade, CategoriaNovidade, FormNovidade } from '../../types/novidades';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NovidadesAdmin: React.FC = () => {
    const [novidades, setNovidades] = useState<Novidade[]>([]);
    const [categorias, setCategorias] = useState<CategoriaNovidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingNovidade, setEditingNovidade] = useState<Novidade | null>(null);
    const [formData, setFormData] = useState<FormNovidade>({
        titulo: '',
        slug: '',
        descricao_curta: '',
        conteudo: '',
        categoria_id: 0,
        status: 'ativo',
        data_publicacao: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [novidadesData, categoriasData] = await Promise.all([
                novidadesService.getNovidades(),
                novidadesService.getCategorias()
            ]);
            setNovidades(novidadesData);
            setCategorias(categoriasData);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingNovidade) {
                await novidadesService.updateNovidade(editingNovidade.id, formData);
            } else {
                await novidadesService.createNovidade(formData);
            }
            await loadData();
            resetForm();
            setShowForm(false);
        } catch (err) {
            setError('Erro ao salvar novidade');
            console.error(err);
        }
    };

    const handleEdit = (novidade: Novidade) => {
        setEditingNovidade(novidade);
        setFormData({
            titulo: novidade.titulo,
            slug: novidade.slug,
            descricao_curta: novidade.descricao_curta,
            conteudo: novidade.conteudo,
            imagem_url: novidade.imagem_url,
            categoria_id: novidade.categoria_id,
            status: novidade.status,
            data_publicacao: novidade.data_publicacao.split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta novidade?')) {
            try {
                await novidadesService.deleteNovidade(id);
                await loadData();
            } catch (err) {
                setError('Erro ao excluir novidade');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            slug: '',
            descricao_curta: '',
            conteudo: '',
            categoria_id: 0,
            status: 'ativo',
            data_publicacao: new Date().toISOString().split('T')[0]
        });
        setEditingNovidade(null);
    };

    if (loading) return <div className="p-4">Carregando...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Novidades</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Nova Novidade
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Título</label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Descrição Curta</label>
                            <textarea
                                value={formData.descricao_curta}
                                onChange={(e) => setFormData({ ...formData, descricao_curta: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Categoria</label>
                            <select
                                value={formData.categoria_id}
                                onChange={(e) => setFormData({ ...formData, categoria_id: Number(e.target.value) })}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Data de Publicação</label>
                            <input
                                type="date"
                                value={formData.data_publicacao}
                                onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-2">URL da Imagem</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.imagem_url || ''}
                                    onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Cole a URL da imagem aqui"
                                />
                                {formData.imagem_url && (
                                    <div className="w-32 h-32 relative">
                                        <img
                                            src={formData.imagem_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imagem_url: undefined })}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-2">Conteúdo</label>
                            <textarea
                                value={formData.conteudo}
                                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                                className="w-full p-2 border rounded h-32"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            {editingNovidade ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Imagem
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Título
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoria
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {novidades.map((novidade) => (
                            <tr key={novidade.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {novidade.imagem_url ? (
                                        <img 
                                            src={novidade.imagem_url} 
                                            alt={novidade.titulo}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">Sem imagem</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                        {novidade.titulo}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                        {novidade.descricao_curta}
                                    </div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{novidade.categoria?.nome}</div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(novidade.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        novidade.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {novidade.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            onClick={() => handleEdit(novidade)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(novidade.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                            title="Excluir"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 