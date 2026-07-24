import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import despesaService from '../../service/despesaService';
import { useValoresVisiveis } from '../../hooks/useValoresVisiveis';

const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DashboardAnual = () => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valoresVisiveis, setValoresVisiveis] = useValoresVisiveis();
  const [mediaMeses, setMediaMeses] = useState(6);
  const [mediaAgruparPor, setMediaAgruparPor] = useState('TIPO');
  const [mediaPage, setMediaPage] = useState(0);
  const [mediaGastos, setMediaGastos] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 10
  });
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/resumo/anual', { params: { ano } })
      .then(res => setDados(res.data))
      .catch(err => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  }, [ano]);

  useEffect(() => {
    setLoadingMedia(true);
    despesaService.mediaGastos({
      meses: mediaMeses || 6,
      agruparPor: mediaAgruparPor,
      page: mediaPage,
      size: 10
    })
      .then(res => setMediaGastos(res.data))
      .catch(err => console.error("Erro ao carregar media de gastos:", err))
      .finally(() => setLoadingMedia(false));
  }, [mediaMeses, mediaAgruparPor, mediaPage]);

  const totais = useMemo(() => {
    return dados.reduce((acc, mes) => ({
      renda: acc.renda + (mes.totalRenda || 0),
      gastos: acc.gastos + (mes.totalGastos || 0),
      lucro: acc.lucro + (mes.lucro || 0)
    }), { renda: 0, gastos: 0, lucro: 0 });
  }, [dados]);

  const dadosGrafico = useMemo(() => {
    return dados.map(d => ({
      mes: meses[d.mes] || '',
      renda: d.totalRenda || 0,
      gastos: d.totalGastos || 0,
      lucro: d.lucro || 0
    }));
  }, [dados]);

  const formatarValorGrande = (valor) => {
    if (!valoresVisiveis) return 'R$ ••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatarMoeda = (valor) => {
    return `R$ ${(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((p, index) => (
            <p key={index} style={{ color: p.color }} className="text-sm">
              {p.name}: R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Anual</h1>
            <p className="text-sm text-gray-500">Resumo financeiro do ano</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <button
            type="button"
            onClick={() => setValoresVisiveis((visivel) => !visivel)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition hover:bg-gray-50"
          >
            {valoresVisiveis ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Ano</label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={ano}
              onChange={e => setAno(parseInt(e.target.value) || new Date().getFullYear())}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Renda Anual</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatarValorGrande(totais.renda)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="text-green-500" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Gastos Anuais</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatarValorGrande(totais.gastos)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <ArrowDown className="text-red-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl shadow-sm border ${totais.lucro >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Lucro Total</p>
                  <p className={`text-2xl font-bold mt-1 ${totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatarValorGrande(totais.lucro)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${totais.lucro >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totais.lucro >= 0 ? (
                    <ArrowUp className={totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                  ) : (
                    <ArrowDown className={totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Resumo Mensal</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50">Mês</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Renda</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Gastos</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((d) => (
                    <tr key={d.mes} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-800">{meses[d.mes]}</td>
                      <td className="p-4 text-sm text-green-600 text-right font-medium">
                        R$ {(d.totalRenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-sm text-red-600 text-right font-medium">
                        R$ {(d.totalGastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 text-sm text-right font-bold ${(d.lucro || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {(d.lucro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-200">
                  <tr>
                    <td className="p-4 font-bold text-gray-800">TOTAL</td>
                    <td className="p-4 font-bold text-green-600 text-right">
                      R$ {totais.renda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-bold text-red-600 text-right">
                      R$ {totais.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-4 font-bold text-right ${totais.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {totais.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 p-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Média de Gastos</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Consulta sem compras parceladas, considerando os últimos {mediaMeses || 6} meses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Últimos meses</label>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    className="w-full sm:w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={mediaMeses}
                    onChange={(e) => {
                      setMediaMeses(Math.max(1, parseInt(e.target.value, 10) || 1));
                      setMediaPage(0);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Agrupar por</label>
                  <select
                    className="w-full sm:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={mediaAgruparPor}
                    onChange={(e) => {
                      setMediaAgruparPor(e.target.value);
                      setMediaPage(0);
                    }}
                  >
                    <option value="TIPO">Tipo</option>
                    <option value="DESCRICAO">Descricao</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50">
                      {mediaAgruparPor === 'DESCRICAO' ? 'Descricao' : 'Tipo'}
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50">Tipo</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Valor Mensal</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-center">
                      Qtd. nos ultimos {mediaMeses || 6} meses
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">
                      Impacto Anual Estimado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMedia ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-sm text-gray-500">
                        Carregando media de gastos...
                      </td>
                    </tr>
                  ) : mediaGastos.content.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-sm text-gray-500">
                        Nenhum gasto encontrado para esse periodo.
                      </td>
                    </tr>
                  ) : (
                    mediaGastos.content.map((item, index) => (
                      <tr key={`${item.agrupamento}-${item.tipo}-${index}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-gray-800">{item.agrupamento}</td>
                        <td className="p-4 text-sm text-gray-600">{item.tipo}</td>
                        <td className="p-4 text-sm text-red-600 text-right font-semibold">
                          {formatarMoeda(item.valorMensal)}
                        </td>
                        <td className="p-4 text-sm text-gray-600 text-center font-medium">{item.quantidade}</td>
                        <td className="p-4 text-sm text-gray-800 text-right font-bold">
                          {formatarMoeda(item.impactoAnualEstimado)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {mediaGastos.totalElements || 0} resultado(s)
              </p>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMediaPage((page) => Math.max(page - 1, 0))}
                  disabled={mediaPage === 0 || loadingMedia}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Pagina {(mediaGastos.totalPages || 0) === 0 ? 0 : mediaPage + 1} de {mediaGastos.totalPages || 0}
                </span>
                <button
                  type="button"
                  onClick={() => setMediaPage((page) => page + 1)}
                  disabled={loadingMedia || mediaPage + 1 >= (mediaGastos.totalPages || 0)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnual;
