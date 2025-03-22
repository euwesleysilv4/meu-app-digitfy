import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Copy, Check } from 'lucide-react';

const HashtagGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateHashtags = () => {
    const words = inputText.split(' ').filter(word => word.trim() !== '');
    const newHashtags = words.map(word => `#${word}`).slice(0, 10); // Limitar a 10 hashtags
    setHashtags(newHashtags);
  };

  const handleCopyHashtags = () => {
    const hashtagsString = hashtags.join(' ');
    navigator.clipboard.writeText(hashtagsString);
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
          <Hash className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerador de Hashtags
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
            Crie hashtags relevantes para suas postagens e aumente seu alcance nas redes sociais.
          </p>
        </motion.div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto para Gerar Hashtags
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
            onClick={generateHashtags}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Gerar Hashtags
          </button>

          {/* Hashtags Geradas */}
          {hashtags.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">Hashtags Geradas:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((hashtag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {hashtag}
                  </span>
                ))}
              </div>
              <button
                onClick={handleCopyHashtags}
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
                    <span>Copiar Hashtags</span>
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

export default HashtagGenerator; 