import api from '../lib/api';

const despesaService = {
  listar: (params) => api.get('/despesa', { params }),
  mediaGastos: (params) => api.get('/despesa/media-gastos', { params }),
  salvar: (dados) => api.post('/despesa', dados),
  atualizar: (id, dados) => api.put(`/despesa/${id}`, dados),
  excluir: (id) => api.delete(`/despesa/${id}`)
};

export default despesaService
