"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Avtomatik ravishda 4 soniyadan keyin o'chirish
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast konteyneri */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-[300px] max-w-md p-4 rounded-xl shadow-lg backdrop-blur-lg border
              flex items-center gap-3 transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-right-5 fade-in-50
              ${
                toast.type === 'success' 
                  ? 'bg-green-500/90 text-white border-green-400/30' 
                  : toast.type === 'error'
                  ? 'bg-red-500/90 text-white border-red-400/30'
                  : toast.type === 'warning'
                  ? 'bg-yellow-500/90 text-white border-yellow-400/30'
                  : 'bg-blue-500/90 text-white border-blue-400/30'
              }
            `}
          >
            {/* Ikonka */}
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              {toast.type === 'warning' && <XCircle size={20} />}
              {toast.type === 'info' && <CheckCircle size={20} />}
            </div>
            
            {/* Xabar matni */}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            {/* Yopish tugmasi */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
