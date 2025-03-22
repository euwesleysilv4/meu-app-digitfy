import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Copy, Check } from 'lucide-react';

const PersuasiveCopy = () => {
  const [inputText, setInputText] = useState('');
  const [persuasiveCopy, setPersuasiveCopy] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCopy = () => {
    // Simulação de geração de copy persuasiva
    const generatedCopy = `✨ Transforme seu produto em uma solução irresistível! Compre agora e aproveite a oferta exclusiva!`;
    setPersuasiveCopy(generatedCopy);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(persuasiveCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center space-x-3">
          <Edit3 className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerador de Copy Persuasiva
          </h1>
        </div>

        {/* Descrição */}
        <motion.div 
          className="bg-emerald-50/50 rounded-xl p-6 shadow-sm border border-emerald-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-emerald-600">
            Crie textos persuasivos que convertem e atraem a atenção do seu público.
          </p>
        </motion.div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto para Gerar Copy
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3"
              placeholder="Digite seu texto aqui..."
            />
          </div>

          <button
            onClick={generateCopy}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Gerar Copy
          </button>

          {/* Copy Gerada */}
          {persuasiveCopy && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">Copy Gerada:</h3>
              <p className="mt-2 text-gray-700">{persuasiveCopy}</p>
              <button
                onClick={handleCopy}
                className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PersuasiveCopy; 