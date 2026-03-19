import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import usuarioService from '../../service/usuarioService';

function CadastroUsuario() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const userRoleLogado = localStorage.getItem('role');
  
  const editando = !!state?.usuario || !!id;

  const [formData, setFormData] = useState({
    id: state?.usuario?.id || '',
    nome: state?.usuario?.nome || '',
    email: state?.usuario?.email || '',
    senha: '', 
    role: state?.usuario?.role || 'USER'
  });

  useEffect(() => {
    if (state?.usuario) {
      setFormData({ ...state.usuario, senha: '' });
    } 
    
    else if (id) {
      usuarioService.buscar(id)
        .then(response => {
          setFormData({ ...response.data, senha: '' });
        })
        .catch(err => {
          console.error("Erro ao carregar perfil:", err);
          alert("Erro ao buscar dados do usuário.");
        });
    }
  }, [id, state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Decide qual método chamar no service baseado no estado
    const acao = editando 
      ? usuarioService.atualizar(formData.id, formData) 
      : usuarioService.salvar(formData);

    acao.then(() => {
        alert("Dados salvos com sucesso!");
        
        navigate(userRoleLogado === 'ADMIN' ? '/usuarios' : '/');
      })
      .catch(error => {
        const mensagemErro = error.response?.data?.mensagem || error.message;
        alert("Erro ao processar usuário: " + mensagemErro);
        console.error("Detalhes do erro:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-xl mx-auto">
        
        <header className="flex justify-center items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="text-blue-600" />
            {editando ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-usuario" onSubmit={handleSubmit}>
            
            {/* Campo Nome */}
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            {/* Campo E-mail */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail (Login)</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            {/* Campo Senha */}
            <div className="mb-4">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                {editando ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
              </label>
              <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required={!editando}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            {/* Campo Perfil (Role) */}
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Nível de Acesso
              </label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} disabled={userRoleLogado !== 'ADMIN'}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md outline-none bg-white 
                  ${userRoleLogado !== 'ADMIN' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500'}`}>
                <option value="USER">Usuário Comum</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {userRoleLogado !== 'ADMIN' && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  Apenas administradores podem alterar o nível de acesso.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-6">
              <Link to="/usuarios" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <ArrowLeft size={20}/> Voltar
              </Link>
              
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md shadow-blue-100"
              >
                <Save size={20} /> {editando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuario;