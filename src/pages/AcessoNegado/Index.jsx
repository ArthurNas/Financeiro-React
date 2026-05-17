import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export default function AcessoNegado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Acesso Negado</h1>

        <p className="text-gray-500">
          Voc&ecirc; n&atilde;o possui permiss&atilde;o para acessar esta p&aacute;gina.
          Entre em contato com o administrador se acha que isso &eacute; um erro.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Home className="h-5 w-5" />
            Voltar ao In&iacute;cio
          </button>
        </div>
      </div>
    </div>
  );
}
