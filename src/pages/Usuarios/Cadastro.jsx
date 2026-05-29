import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import usuarioService from '../../service/usuarioService';
import { AuthContext } from '../../components/AuthContext';

const INITIAL_STATE = { id: '', nome: '', email: '', senha: '', role: 'USER' };

function CadastroUsuario() {
  const { state } = useLocation();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'error', message: '' });
  const [salvando, setSalvando] = useState(false);

  const editando = !!state?.usuario || !!id;

  const [formData, setFormData] = useState({ ...INITIAL_STATE });

  useEffect(() => {
    if (state?.usuario) {
      setFormData({ ...state.usuario, senha: '' });
    } else if (id) {
      usuarioService.buscar(id)
        .then(response => {
          setFormData({ ...response.data, senha: '' });
        })
        .catch(err => {
          console.error("Erro ao carregar perfil:", err);
          showBanner("error", "Erro ao buscar dados do usuário.");
        });
    }
  }, [id, state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);

    const acao = editando
      ? usuarioService.atualizar(formData.id, formData)
      : usuarioService.salvar(formData);

    acao.then(() => {
        if (editando) {
          navigate('/usuarios');
        } else {
          showBanner("success", "Usuário registrado com sucesso!");
          setFormData({ ...INITIAL_STATE });
        }
      })
      .catch(error => {
        setModal({
          open: true,
          type: "error",
          message: "Erro ao processar usuário: " + (error.response?.data?.mensagem || error.message),
        });
        console.error("Detalhes do erro:", error);
      })
      .finally(() => setSalvando(false));
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

            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail (Login)</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                {editando ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
              </label>
              <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required={!editando}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>

            {user?.role === 'ROLE_ADMIN' && (
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Acesso
                </label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-blue-500">
                  <option value="USER">Usuário Comum</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <Link to="/usuarios" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <ArrowLeft size={20}/> Voltar
              </Link>

              <button type="submit" disabled={salvando}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} /> {editando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>

        {banner && banner.type === 'success' && (
          <div className="p-4 rounded-lg mt-4 border bg-green-100 text-green-800 border-green-300">
            {banner.message}
          </div>
        )}
      </div>

      <MessageModal isOpen={modal.open} type={modal.type} message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </div>
  );
}

export default CadastroUsuario;
