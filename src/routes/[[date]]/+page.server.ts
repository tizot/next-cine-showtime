import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	return { date: params.date ? new Date(params.date) : new Date() };
};
