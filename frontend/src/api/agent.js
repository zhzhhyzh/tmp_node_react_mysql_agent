import { api } from './client';

export const agentApi = {
  chat: (message, history = []) =>
    api.post('/agent/chat', { message, history }).then((r) => r.data),
};
