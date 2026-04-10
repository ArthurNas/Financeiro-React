import { useEffect, useState } from 'react';
import usuarioService from '../../service/usuarioService';
import { Plus, Trash2, Search, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtroNome, setFiltroNome] = useState('');
    const navigate = useNavigate();

    const buscarDados = async () => {
        try {
            const response = await usuarioService.listar({
                nome: filtroNome,
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    useEffect(() => {
        buscarDados();
    }, [filtroNome]);

    const deletarUsuario = (id) => {
        if (window.confirm("Deseja realmente excluir este usuário?")) {
            usuarioService.excluir(id)
                .then(() => buscarDados())
                .catch(err => alert("Erro ao deletar: " + err.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
            <div className="max-w-4xl mx-auto">
                
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Consulta de Usuários
                        </h1>
                    </div>
                    
                    <Link to="/cadastroUsuario" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <Plus size={20} /> Novo Usuário
                    </Link>
                </header>

                {/* Barra de Filtros */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar por Nome</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="text" placeholder="Nome..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={() => setFiltroNome('')} className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3">
                        Limpar
                    </button>
                </div>

                {/* Tabela Estilizada */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Nome</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">E-mail</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Perfil</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-gray-700">{u.nome}</td>
                                    <td className="p-4 text-sm text-gray-500">{u.email}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        {/* Navega para a rota de edição passando o ID */}
                                        <button onClick={() => navigate('/cadastroUsuario', { state: { usuario: u } })}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deletarUsuario(u.id)} 
                                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                            title="Excluir Usuário"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {usuarios.length === 0 && (
                        <div className="p-8 text-center text-gray-400">Nenhum usuário encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Usuarios;