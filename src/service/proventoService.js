import api from '../lib/api';
const rota = '/provento'

const proventoService = {
  listar: (params) => api.get(rota, { params }),
  salvar: (dados) => api.post(rota, dados),
  atualizar: (id, dados) => api.put(rota + `/${id}`, dados),
  excluir: (id) => api.delete(rota + `/${id}`)
};

export default proventoService