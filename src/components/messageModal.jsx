import { useEffect, useRef } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiX } from 'react-icons/hi';

export default function MessageModal({ isOpen, onClose, type = 'success', title, message }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  /*const btnRef = useRef(null);

  useEffect(() => {
    if (open) {
      
      requestAnimationFrame(() => {
        if (btnRef.current) {
          btnRef.current.focus();
        }
      });
    }
  }, [open]);

  if (!open) return null;*/

  return (
    // Overlay (Background)
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center p-4">
      
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in duration-300">
        
        {/* Botão de fechar (o "x") */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX size={20} />
        </button>

        <div className="text-center">
          {/* Ícone Dinâmico */}
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <HiCheckCircle className="text-green-500 h-16 w-16" />
            ) : (
              <HiExclamationCircle className="text-red-500 h-16 w-16" />
            )}
          </div>

          {/* Título e Mensagem */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title || (isSuccess ? 'Sucesso!' : 'Erro!')}
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Botão de Confirmação */}
          <button autoFocus onClick={onClose} className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all cursor-pointer shadow-lg 
                ${isSuccess ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}