import { useEffect, useState } from 'react';
import tipoService from '../../service/tipoService';
import { Plus, Trash2, Wallet, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';
import MessageModal from '../../components/messageModal';

function TipoDespesa() {
    const [tipos, setDespesas] = useState([])
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });
    const [modal, setModal] = useState({ open: false, type: 'success', message: '' });

    const [filtroDescricao, setFiltroDescricao] = useState('')

    const buscarDados = async () => {
      try {
          const response = await tipoService.listar({
                  descricao: filtroDescricao,
              });
          setDespesas(response.data);
      } catch (error) {
          console.error("Erro ao buscar dados filtrados:", error);
      }
    };

    useEffect(() => {
        buscarDados();
    }, [filtroDescricao]);

    const handleAbrirConfirmacao = (id) => {
      setConfirmModal({ open: true, idParaExcluir: id });
    };

    const confirmarExclusao = () => {
      const id = confirmModal.idParaExcluir;
      if (!id) return;

      tipoService.excluir(id)
        .then(() => {
          buscarDados();
        })
        .catch(err => {
          setModal({
            open: true,
            type: "error",
            message: "Erro ao excluir tipo: " + (error.response?.data?.mensagem || error.message),
          });
          console.error("Erro ao deletar:", err);
        });
    };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
                Tipos de Despesas
            </h1>
          </div>
          
          <Link to="/cadastroTipo" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus size={20} /> Novo Tipo
          </Link>
        </header>

        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar Descrição</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Ex: Alimentação..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={filtroDescricao} onChange={(e) => setFiltroDescricao(e.target.value)}/>
            </div>
          </div>

          <button 
            onClick={() => { setFiltroDescricao(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            Limpar
          </button>
        </div>

        {/* Tabela Estilizada */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">Descrição</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">{t.descricao}</td>
                  <td className="p-4 text-center flex justify-end gap-2">
                    <button onClick={() => navigate('/cadastroTipo', { state: { tipo: t } })}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleAbrirConfirmacao(t.id)} className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 size={18} />
                    </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tipos.length === 0 && (
            <div className="p-8 text-center text-gray-400">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.open}
        title="Excluir Tipo"
        message="Você tem certeza?"
        onClose={() => setConfirmModal({ open: false, idParaExcluir: null })}
        onConfirm={confirmarExclusao}
      />

      <MessageModal isOpen={modal.open} type={modal.type}message={modal.message}
        onClose={() => {
          setModal({ ...modal, open: false });
        }}
      />
    </div>
  )
}

export default TipoDespesa