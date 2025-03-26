import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  // Configurar autoclose
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Definir ícone e cores com base no tipo
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getToastStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-5 right-5 z-50 max-w-md p-4 ${bgColor} border ${borderColor} rounded-lg shadow-lg`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className={`ml-3 ${textColor} flex-1 pr-8`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast; 