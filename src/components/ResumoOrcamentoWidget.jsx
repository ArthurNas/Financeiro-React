import { useEffect, useState } from 'react';
import { DollarSign, Target, AlertTriangle, Loader2 } from 'lucide-react';
import orcamentoService from '../service/orcamentoService';

function calcularCor(proporcao) {
  if (proporcao > 1) return 'bg-red-500 animate-pulse';
  if (proporcao > 0.8) return 'bg-yellow-500';
  return 'bg-blue-600';
}

function formatar(valor) {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ResumoOrcamentoWidget({ mes, ano }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orcamento, setOrcamento] = useState(null);

  useEffect(() => {
    if (!mes || !ano) return;

    setLoading(true);
    setError(null);

    orcamentoService.dashboard({ mes, ano })
      .then(res => setOrcamento(res.data))
      .catch(err => setError(err.response?.data?.mensagem || 'Erro ao carregar resumo do orçamento'))
      .finally(() => setLoading(false));
  }, [mes, ano]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      </div>
    );
  }

  if (!orcamento || !orcamento.pilares || orcamento.pilares.length === 0) {
    return null;
  }

  const temSaldoNegativo = orcamento.saldoPrevisto < 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Resumo do Orçamento</h2>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Renda Estimada</p>
          <p className="text-sm font-bold text-gray-700">R$ {formatar(orcamento.rendaEstimada)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {orcamento.pilares.map((pilar) => {
          const planejado = Number(pilar.valorPlanejado);
          const gasto = Number(pilar.valorGasto);
          const proporcao = planejado > 0 ? gasto / planejado : 0;
          const isOutros = /outros/i.test(pilar.nomePilar) && /não.*orçado|nao.*orcado/i.test(pilar.nomePilar);

          const containerClass = isOutros
            ? 'border border-dashed border-red-200 bg-red-50/50 rounded-lg p-4'
            : '';

          return (
            <div key={pilar.nomePilar} className={containerClass}>
              {isOutros && (
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs font-semibold text-red-600 uppercase">Não Orçado</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-gray-700">{pilar.nomePilar}</span>
                <span className="text-xs text-gray-500">
                  R$ {formatar(gasto)} / R$ {formatar(planejado)}
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${calcularCor(proporcao)}`}
                  style={{ width: `${Math.min(proporcao * 100, 100)}%` }}
                />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{formatar(proporcao * 100)}%</span>
                <span className={`text-xs font-medium ${pilar.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Saldo: {pilar.saldo >= 0 ? '+' : ''}R$ {formatar(pilar.saldo)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <DollarSign size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">Total Gasto</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-red-600">R$ {formatar(orcamento.totalGasto)}</span>
          <span className={`text-sm font-bold ${temSaldoNegativo ? 'text-red-500' : 'text-green-600'}`}>
            {orcamento.saldoPrevisto >= 0 ? '+' : ''}R$ {formatar(orcamento.saldoPrevisto)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResumoOrcamentoWidget;
