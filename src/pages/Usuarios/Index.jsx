import { useEffect, useState } from 'react';
import usuarioService from '../../service/usuarioService';
import { Edit2, Plus, Search, Trash2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

    const perfilClass = (role) => {
        if (role === 'ADMIN') return 'bg-purple-100 text-purple-700';
        if (role === 'TESTE') return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 text-gray-800 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Consulta de Usuários
                        </h1>
                    </div>

                    <Link
                        to="/cadastroUsuario"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Novo Usuário
                    </Link>
                </header>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar por Nome</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nome..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={() => setFiltroNome('')} className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3">
                        Limpar
                    </button>
                </div>

                <div className="space-y-3 md:hidden">
                    {usuarios.map((u) => (
                        <div key={u.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-bold text-gray-800">{u.nome}</h2>
                                    <p className="mt-1 truncate text-xs text-gray-500">{u.email}</p>
                                    <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-bold ${perfilClass(u.role)}`}>
                                        {u.role}
                                    </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/cadastroUsuario', { state: { usuario: u } })}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                                        aria-label="Editar usuário"
                                    >
                                        <Edit2 size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deletarUsuario(u.id)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                        aria-label="Excluir usuário"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {usuarios.length === 0 && (
                        <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
                            Nenhum usuário encontrado.
                        </div>
                    )}
                </div>

                <div className="hidden bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-100 md:block">
                    <table className="w-full min-w-[720px] text-left border-collapse">
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
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${perfilClass(u.role)}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate('/cadastroUsuario', { state: { usuario: u } })}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                        >
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
