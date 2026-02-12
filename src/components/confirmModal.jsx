import React from 'react';
import { HiExclamation, HiX } from 'react-icons/hi';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center p-4">
      
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in duration-200">
        
        {/* Botão fechar lateral */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX size={20} />
        </button>

        <div className="text-center">
          {/* Ícone de Alerta */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <HiExclamation className="text-red-600 h-10 w-10" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {title || "Confirmação"}
          </h2>
          <p className="text-gray-600 mb-6">
            {message || "Tem certeza que deseja realizar esta ação?"}
          </p>

          {/* Botões Sim/Não */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
              Não
            </button>
            <button onClick={() => { onConfirm(); onClose();}}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all cursor-pointer">
              Sim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}