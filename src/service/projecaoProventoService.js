import api from '../lib/api';

const projecaoProventoService = {
  listarPendentes: (params) => api.get('/projecao-provento', { params }),
  confirmar: (id, dados) => api.post(`/projecao-provento/${id}/confirmar`, dados),
  criarRecorrente: (dados) => api.post('/projecao-provento/recorrente', dados),
  excluirMes: (id) => api.post(`/projecao-provento/${id}/excluir-mes`),
  excluir: (id) => api.delete(`/projecao-provento/${id}`),
};

export default projecaoProventoService;
