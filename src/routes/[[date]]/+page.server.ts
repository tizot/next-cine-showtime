import type { PageServerLoad, RouteParams } from './$types';
import { fetchAllMoviesSorted } from '$lib/server';
import { DEFAULT_THEATERS, theaterIds } from '$lib/theaters';
import { startOfToday } from 'date-fns';
import type { Cookies } from '@sveltejs/kit';
import type { TheaterId } from '$lib/types';
import { sortBy } from 'lodash-es';

function getDate(params: RouteParams) {
  try {
    return params.date != null ? new Date(params.date) : startOfToday();
  } catch (_: unknown) {
    return startOfToday();
  }
}

const COOKIE_THEATERS_KEY = 'theaters';

function getTheatersFromUrl(url: URL, cookies: Cookies) {
  const theaters = url.searchParams
    .getAll('theater')
    .filter((t): t is TheaterId => t in theaterIds);
  if (theaters.length === 0) {
    cookies.delete(COOKIE_THEATERS_KEY);
    return null;
  }
  cookies.set(COOKIE_THEATERS_KEY, JSON.stringify(theaters));
  return theaters;
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

export const load: PageServerLoad = ({ params, cookies, url }) => {
  const activeDate = getDate(params);
  const allTheaters = sortBy(Object.keys(theaterIds) as Array<TheaterId>, (s) =>
    s.toLocaleLowerCase(),
  );
  const activeTheaters = getTheatersFromUrl(url, cookies) ?? getTheatersFromCookie(cookies);
  const movies = fetchAllMoviesSorted(activeTheaters, activeDate);

  return { activeDate, movies, allTheaters, activeTheaters };
};
