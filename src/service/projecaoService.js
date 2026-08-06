import api from '../lib/api';

const projecaoService = {
  listarPendentes: (params) => api.get('/projecao', { params }),
  confirmar: (id, dados) => api.post(`/projecao/${id}/confirmar`, dados),
  criarRecorrente: (dados) => api.post('/projecao/recorrente', dados),
  excluirMes: (id) => api.post(`/projecao/${id}/excluir-mes`),
  excluir: (id) => api.delete(`/projecao/${id}`),
};

export default projecaoService;
