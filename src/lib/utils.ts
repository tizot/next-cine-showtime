import { intlFormat } from 'date-fns';
import { toSeconds, type Duration } from 'iso8601-duration';
import type { Movie, TheaterId } from './types';
import { chain, isEmpty } from 'lodash';

export function formatDate(date: Date) {
  return intlFormat(
    date,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Paris' },
    { locale: 'fr-FR' },
  );
}

export function formatDuration(duration: Duration, withSeconds = false) {
  const totalSeconds = toSeconds(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - 3600 * hours) / 60);
  const seconds = totalSeconds - 60 * minutes - 3600 * hours;
  if (withSeconds && seconds !== 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m`;
}

export function filterShowtimes(
  movie: Movie,
  theaters: Array<TheaterId>,
  dropDubbedShowtimes: boolean,
) {
  const showtimesByTheater: Movie['showtimes'] = chain(movie.showtimes)
    .mapValues((showtimes) =>
      dropDubbedShowtimes ? showtimes.filter((s) => s.version !== 'DUBBED') : showtimes,
    )
    .pickBy((showtimes, theater) => theaters.includes(theater as TheaterId) && showtimes.length > 0)
    .value();

  return isEmpty(showtimesByTheater) ? null : { ...movie, showtimes: showtimesByTheater };
}
