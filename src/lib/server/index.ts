import { cloneDeep, forEach, zip } from 'lodash';
import { theaterIds } from '../theaters';
import type { Movies, TheaterId } from '../types';
import { fetchMovies } from './allocine/movies';
import { fetchSensCritiqueRating } from './sens-critique';

export async function fetchAllMovies(theaters: Array<TheaterId>, date: Date) {
  const movies: Movies = {};

  for (const theater of theaters) {
    let theaterMovies: Movies = {};
    if (theater in theaterIds) {
      theaterMovies = cloneDeep(await fetchMovies(theater, date));
    } else {
      console.warn(`Theater not found '${theater}'`);
      continue;
    }

    forEach(theaterMovies, (details, title) => {
      if (!(title in movies)) {
        movies[title] = details;
      } else {
        movies[title].showtimes = {
          ...movies[title].showtimes,
          ...details.showtimes,
        };
      }
    });
  }

  const allTitles = Object.keys(movies);
  const scData = await Promise.all(
    allTitles.map((title) => fetchSensCritiqueRating(title, movies[title].year)),
  );
  zip(allTitles, scData).forEach(([title, data]) => {
    if (!title) return;
    movies[title] = {
      ...movies[title],
      sensCritiqueRating: data?.rating,
      sensCritiqueUrl: data?.url,
    };
  });

  return movies;
}
