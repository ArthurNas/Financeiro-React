import api from '../lib/api';

const objetivoService = {
  listarAtivos: () => api.get('/objetivo/ativos'),
  criar: (dados) => api.post('/objetivo', dados),
  consumir: (dados) => api.post('/objetivo/consumir', dados),
};

export default objetivoService;
