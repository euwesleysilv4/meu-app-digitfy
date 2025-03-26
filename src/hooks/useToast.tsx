import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Configurações de estilo e ícones para cada tipo de toast
const toastConfig = {
  success: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  },
  error: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: <XCircle className="h-5 w-5 text-red-500" />
  },
  warning: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
  },
  info: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: <Info className="h-5 w-5 text-blue-500" />
  }
};

// Função para criar um container para os toasts, se não existir
const getToastContainer = () => {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
  }
  
  return container;
};

// Componente de Toast
const ToastComponent: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ 
  toasts, 
  removeToast 
}) => {
  return createPortal(
    <AnimatePresence>
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        
        return (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`${config.bgColor} ${config.textColor} p-4 rounded-lg shadow-md border ${config.borderColor} max-w-md`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {config.icon}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>,
    getToastContainer()
  );
};

export interface UseToastReturn {
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  toasts: Toast[];
  ToastContainer: React.ReactNode;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Remover um toast pelo ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Adicionar um novo toast
  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newToast = {
      id,
      message,
      type,
      duration
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Remover automaticamente após a duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [removeToast]);
  
  // Renderizar o componente de toasts
  useEffect(() => {
    const container = getToastContainer();
    
    return () => {
      // Limpar o container ao desmontar
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);
  
  return {
    showToast,
    removeToast,
    toasts,
    ToastContainer: <ToastComponent toasts={toasts} removeToast={removeToast} />
  };
};

export default useToast; 