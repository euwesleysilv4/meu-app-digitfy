import React from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Novidade } from '../types/novidades';
import { X, Calendar } from 'lucide-react';

interface NovidadeModalProps {
    novidade: Novidade;
    onClose: () => void;
}

export const NovidadeModal: React.FC<NovidadeModalProps> = ({ novidade, onClose }) => {
    const modalContent = (
        <div className="fixed inset-0 min-h-screen w-full bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative">
                {/* Cabeçalho */}
                <div className="py-4 px-6 border-b border-gray-200">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">{novidade.titulo}</h2>
                            <span className="text-gray-500 text-sm flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {format(new Date(novidade.data_publicacao), 'dd MMM yyyy', { locale: ptBR })}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="py-4 px-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {novidade.imagem_url && (
                        <div className="mb-4">
                            <img
                                src={novidade.imagem_url}
                                alt={novidade.titulo}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        </div>
                    )}
                    <div className="prose max-w-none">
                        <p className="text-lg text-gray-600 mb-4">{novidade.descricao_curta}</p>
                        <div className="text-gray-700 whitespace-pre-wrap">{novidade.conteudo}</div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="py-4 px-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}; 