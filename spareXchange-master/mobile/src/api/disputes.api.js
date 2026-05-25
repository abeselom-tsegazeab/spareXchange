// Module 7 — Platform dispute reports API.

import api from './client';

export const disputesApi = {
	create: ({ targetId, exchangeId, reason, description }) =>
		api.post('/disputes', { targetId, exchangeId, reason, description }),
};

export default disputesApi;
