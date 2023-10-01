import type { PageServerLoad } from './$types';
import { fetchAllMovies } from '$lib/server';
import { DEFAULT_THEATERS } from '$lib/theaters';

export const load: PageServerLoad = ({ params }) => {
  const activeDate = params.date ? new Date(params.date) : new Date();
  const movies = fetchAllMovies(DEFAULT_THEATERS, activeDate);

  return { activeDate, movies };
};
