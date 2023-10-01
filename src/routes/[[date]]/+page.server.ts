import type { PageServerLoad, RouteParams } from './$types';
import { fetchAllMoviesSorted } from '$lib/server';
import { DEFAULT_THEATERS, theaterIds } from '$lib/theaters';
import { startOfToday } from 'date-fns';
import type { Cookies } from '@sveltejs/kit';
import { COOKIE_THEATERS_KEY } from '$lib/cookies';
import type { TheaterId } from '$lib/types';
import { sortBy } from 'lodash';

function getDate(params: RouteParams) {
  try {
    return params.date != null ? new Date(params.date) : startOfToday();
  } catch (_: unknown) {
    return startOfToday();
  }
}

function getTheatersFromCookie(cookies: Cookies) {
  const encodedTheaters = cookies.get(COOKIE_THEATERS_KEY);
  try {
    const theaters = !encodedTheaters ? [] : (JSON.parse(encodedTheaters) as Array<TheaterId>);
    if (!theaters || theaters.length === 0) {
      return DEFAULT_THEATERS;
    }
    return theaters;
  } catch (_: unknown) {
    return DEFAULT_THEATERS;
  }
}

export const load: PageServerLoad = ({ params, cookies }) => {
  const activeDate = getDate(params);
  const movies = fetchAllMoviesSorted(DEFAULT_THEATERS, activeDate);
  const allTheaters = sortBy(Object.keys(theaterIds) as Array<TheaterId>, (s) =>
    s.toLocaleLowerCase(),
  );
  const activeTheaters = getTheatersFromCookie(cookies);

  return { activeDate, movies, allTheaters, activeTheaters };
};
