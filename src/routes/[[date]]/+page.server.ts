import type { PageServerLoad, RouteParams } from './$types';
import { fetchAllMoviesSorted } from '$lib/server';
import { DEFAULT_THEATERS, theaterIds } from '$lib/theaters';
import { startOfToday } from 'date-fns';
import type { Actions, Cookies } from '@sveltejs/kit';
import type { TheaterId } from '$lib/types';
import { sortBy } from 'lodash-es';
import { fetchMovies } from '$lib/server/allocine/movies';
import { fetchSensCritiqueRating } from '$lib/server/sens-critique';
import { delay } from '$lib/utils';
import { clearCache } from '../../lib/server/cache';
import { MOVIES_KV_PREFIX, SENS_CRITIQUE_KV_PREFIX } from '../../lib/server/constants';

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
    cookies.delete(COOKIE_THEATERS_KEY, { path: '/' });
    return null;
  }
  cookies.set(COOKIE_THEATERS_KEY, JSON.stringify(theaters), { path: '/' });
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

const TIME_TO_RESOLVE_MS = 200;

export const load: PageServerLoad = async ({ params, cookies, url }) => {
  const activeDate = getDate(params);
  const allTheaters = sortBy(Object.keys(theaterIds) as Array<TheaterId>, (s) =>
    s.toLocaleLowerCase(),
  );
  const activeTheaters = getTheatersFromUrl(url, cookies) ?? getTheatersFromCookie(cookies);
  const moviesPromise = fetchAllMoviesSorted(activeTheaters, activeDate);

  const moviesOrNull = await Promise.race([
    delay(TIME_TO_RESOLVE_MS).then(() => null),
    moviesPromise,
  ]);

  return {
    activeDate,
    deferred: { movies: moviesOrNull ? moviesOrNull : moviesPromise },
    allTheaters,
    activeTheaters,
  };
};

export const actions: Actions = {
  default: async () => {
    await Promise.all([clearCache(MOVIES_KV_PREFIX), clearCache(SENS_CRITIQUE_KV_PREFIX)]);
  },
};
