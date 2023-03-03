import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import {
  add,
  format,
  formatISO,
  intlFormat,
  isEqual,
  startOfDay,
} from "date-fns";
import { chain, deburr, isEmpty, range, sortBy } from "lodash";

import Showtimes from "./Showtimes";
import type { Movie } from "./types";

const API_ENDPOINT = `${
  process.env.NODE_ENV === "development" ? "http://localhost:4500" : ""
}/api`;
const DEFAULT_CINEMAS = [
  "Luminor HdV",
  "Majestic Bastille",
  "mk2 Beaumarchais",
  "mk2 Saint-Antoine",
];

const formatDate = (date: Date) => {
  return intlFormat(
    date,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Paris",
    },
    {
      locale: "fr-FR",
    }
  );
};

function dropDubbedShowtimes(movie: Movie): Movie | null {
  const showtimesByCinema: Movie["showtimes"] = chain(movie.showtimes)
    .mapValues((showtimes) => showtimes.filter((s) => s.version !== "DUBBED"))
    .pickBy((showtimes) => showtimes.length > 0)
    .value();

  return isEmpty(showtimesByCinema)
    ? null
    : { ...movie, showtimes: showtimesByCinema };
}

const App = () => {
  const today = startOfDay(new Date());
  const dates = range(0, 8).map((i) => add(today, { days: i }));
  const date = useLoaderData() as Date;

  const [allCinemas, setAllCinemas] = useState([]);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState(DEFAULT_CINEMAS);
  const [movieQuery, setMovieQuery] = useState("");
  const [hideDubbedShowtimes, setHideDubbedShowtimes] = useState(false);

  const moviesToDisplay = chain(movies)
    .filter((m) =>
      deburr(m.title.toLocaleLowerCase()).includes(
        deburr(movieQuery.toLocaleLowerCase())
      )
    )
    .map((movie) => (hideDubbedShowtimes ? dropDubbedShowtimes(movie) : movie))
    .compact()
    .value();
  console.log({ moviesToDisplay });

  useEffect(() => {
    const loadCinemas = async () => {
      const response = await fetch(`${API_ENDPOINT}/cinemas`, {
        method: "GET",

        headers: { "Content-Type": "application/json" },
      });
      const cinemasOrError = await response.json();
      if (cinemasOrError.message) {
        console.error(cinemasOrError.message);
        throw new Error(cinemasOrError.message);
      }
      setAllCinemas(cinemasOrError);
    };
    loadCinemas();
    return () => {};
  }, []);

  const loadMovies = async () => {
    setIsMoviesLoading(true);
    const response = await fetch(`${API_ENDPOINT}/movies`, {
      method: "POST",
      body: JSON.stringify({
        cinemas,
        date: formatISO(date),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const moviesOrError = await response.json();
    if (moviesOrError.message) {
      console.error(moviesOrError.message);
      throw new Error(moviesOrError.message);
    }
    setMovies(moviesOrError);
    setIsMoviesLoading(false);
  };

  useEffect(() => {
    if (date && cinemas) {
      loadMovies();
    }
    return () => {};
  }, [date, cinemas]);

  const handleSelectCinema = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cine = e.target.value;
    if (cinemas.includes(cine)) {
      setCinemas(cinemas.filter((c) => c !== cine));
    } else {
      setCinemas(sortBy([cine, ...cinemas], (s) => s.toLocaleLowerCase()));
    }
  };

  const handleForceRefresh = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await fetch(`${API_ENDPOINT}/reset-caches`, { method: "POST" });
    loadMovies();
  };

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold my-4">
        Films pour le {formatDate(date)}
      </h1>
      <ul className="md:columns-2 mb-4">
        {dates.map((d) => (
          <li key={d.toISOString()}>
            {isEqual(date, d) ? (
              <span className="font-semibold">{formatDate(d)}</span>
            ) : (
              <Link to={format(d, "/yyyy-MM-dd")}>{formatDate(d)}</Link>
            )}
          </li>
        ))}
      </ul>
      <div className="my-4">
        <form className="flex justify-between space-x-4 items-center">
          <ul className="w-full md:columns-3 sm:columns-2">
            {allCinemas.map((cine) => (
              <li key={cine}>
                <input
                  type="checkbox"
                  id={`checkbox-${cine}`}
                  name={cine}
                  value={cine}
                  checked={cinemas.includes(cine)}
                  onChange={handleSelectCinema}
                />
                <label htmlFor={`checkbox-${cine}`} className="mx-2">
                  {cine}
                </label>
              </li>
            ))}
          </ul>
        </form>
      </div>
      <div className="my-4">
        <div className="grid md:grid-cols-3 md:gap-4 sm:grid-cols-1 sm:gap-2">
          <div>
            <input
              type="text"
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
              placeholder="Filtrer les films"
              className="text-sm my-2 rounded-md w-full"
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              id="hide-dubbed"
              type="checkbox"
              value={hideDubbedShowtimes ? "" : "on"}
              onChange={(e) => setHideDubbedShowtimes(e.target.checked)}
            />
            <label htmlFor="hide-dubbed" className="inline-flex items-center">
              Masquer les films doublés
            </label>
          </div>
        </div>
        <Showtimes movies={moviesToDisplay} isLoading={isMoviesLoading} />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg border p-2"
          onClick={handleForceRefresh}
        >
          Vider le cache
        </button>
      </div>
    </div>
  );
};

export default App;
