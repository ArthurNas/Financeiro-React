import { useEffect, useState } from 'react';
import orcamentoService from '../../service/orcamentoService';
import { Plus, Trash2, Wallet, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';

const MESES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function Orcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });

  const buscarDados = () => {
    orcamentoService.listar()
      .then(response => setOrcamentos(response.data))
      .catch(error => console.error("Erro ao carregar orçamentos:", error));
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const handleAbrirConfirmacao = (id) => {
    setConfirmModal({ open: true, idParaExcluir: id });
  };

  const confirmarExclusao = () => {
    const id = confirmModal.idParaExcluir;
    if (!id) return;

    orcamentoService.excluir(id)
      .then(() => buscarDados())
      .catch(err => console.error("Erro ao deletar:", err));
  };

  const formatarPeriodo = (o) => {
    return `${MESES[o.mesInicio]}/${o.anoInicio} — ${MESES[o.mesFim]}/${o.anoFim}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-800">
      <div className="max-w-4xl mx-auto">

        <header className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  Orçamentos
                </h1>
                <p className="text-sm text-gray-500">Planejamento financeiro por período</p>
              </div>
            </div>

            <Link to="/cadastroOrcamento"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100 hover:scale-105 active:scale-95">
              <Plus size={20} strokeWidth={3} /> Novo Orçamento
            </Link>
          </div>
        </header>

        <div className="space-y-3 md:hidden">
          {orcamentos.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-gray-800">{formatarPeriodo(o)}</h2>
                  <p className="mt-1 text-xs text-gray-500">{o.pilares.length} pilar(es)</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate('/cadastroOrcamento', { state: { orcamento: o } })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                    aria-label="Editar orçamento"
                  >
                    <Edit2 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAbrirConfirmacao(o.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    aria-label="Excluir orçamento"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-400">Renda Estimada</p>
                <p className="mt-1 font-bold text-gray-800">
                  R$ {Number(o.rendaEstimada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
          {orcamentos.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
              Nenhum orçamento encontrado.
            </div>
          )}
        </div>

        <div className="hidden bg-white rounded-xl shadow-sm overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">Período</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Renda Estimada</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Pilares</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium">{formatarPeriodo(o)}</td>
                  <td className="p-4 text-sm">
                    R$ {Number(o.rendaEstimada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{o.pilares.length} pilar(es)</td>
                  <td className="p-4 text-center flex justify-end gap-2">
                    <button onClick={() => navigate('/cadastroOrcamento', { state: { orcamento: o } })}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleAbrirConfirmacao(o.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orcamentos.length === 0 && (
            <div className="p-8 text-center text-gray-400">Nenhum orçamento encontrado.</div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.open}
        title="Excluir Orçamento"
        message="Você tem certeza?"
        onClose={() => setConfirmModal({ open: false, idParaExcluir: null })}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}

export default Orcamento;
