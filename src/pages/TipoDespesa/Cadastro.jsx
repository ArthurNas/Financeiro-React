import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import tipoService from '../../service/tipoService';

function CadastroTipo() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editando = !!state?.tipo;

  const [formData, setFormData] = useState({
    id: state?.tipo?.id || '',
    descricao: state?.tipo?.descricao || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    tipoService.salvar(formData)
      .then(() => {
        //alert("Despesa cadastrada com sucesso!");
        navigate('/tipo'); // Redireciona para a Home após o sucesso
      })
      .catch(error => {
        // Exibe a mensagem de erro do GlobalExceptionHandler do Java, se houver
        alert("Erro ao cadastrar tipo: " + (error.response?.data?.mensagem || error.message));
        console.error("Detalhes do erro:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-xl mx-auto">
        
        {/* Header da Página de Cadastro */}
        <header className="flex justify-center items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold">
            {editando ? 'Editar Tipo' : 'Nova Tipo'}
          </h1>
          
        </header>

        {/* Formulário de Cadastro */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-tipo" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end gap-2">
              <Link to="/" className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded-lg">
                <ArrowLeft size={20}/> Voltar
              </Link>
              
              <button type="submit" form="form-tipo"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Save size={20} /> Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroTipo;