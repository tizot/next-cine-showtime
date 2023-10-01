import { fetchMovies } from '$lib/server/allocine/movies';
import { startOfToday } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const movies = fetchMovies('mk2 Nation', startOfToday());

  return { activeDate: params.date ? new Date(params.date) : new Date(), movies };
};
