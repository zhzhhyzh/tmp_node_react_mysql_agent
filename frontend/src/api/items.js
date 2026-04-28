import { api } from './client';

export const itemsApi = {
  list: () => api.get('/items').then((r) => r.data.items),
  create: (payload) => api.post('/items', payload).then((r) => r.data.item),
  update: (id, payload) => api.put(`/items/${id}`, payload).then((r) => r.data.item),
  remove: (id) => api.delete(`/items/${id}`).then((r) => r.data),
};
