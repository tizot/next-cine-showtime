import _ from "lodash";
import dateFnsTz from "date-fns-tz";
import { GraphQLClient, gql } from "graphql-request";
import { add } from "date-fns";
import { parse as parseDuration } from "iso8601-duration";

import { cache } from "./cache.js";
import { formatDuration } from "./utils.js";
import { search } from "./sens-critique/index.js";

const cinemaIds = {
  "mk2 Beaumarchais": "VGhlYXRlcjpDMDE0MA==",
  "mk2 Saint-Antoine": "VGhlYXRlcjpDMDA0MA==",
  "mk2 Nation": "VGhlYXRlcjpDMDE0NA==",
  "Majestic Bastille": "VGhlYXRlcjpDMDEzOQ==",
  "UGC Lyon Bastille": "VGhlYXRlcjpDMDE0Ng==",
  "UGC Les Halles": "VGhlYXRlcjpDMDE1OQ==",
  "mk2 Bibliothèque": "VGhlYXRlcjpDMjk1NA==",
  "UGC Bercy": "VGhlYXRlcjpDMDAyNg==",
  // "mk2 Beaubourg": "VGhlYXRlcjpDMDA1MA==",
  // "mk2 Odéon St-Michel": "VGhlYXRlcjpDMDA5Mg==",
  // "mk2 Odéon St-Germain": "VGhlYXRlcjpDMDA5Nw==",
  // "UGC Danton": "VGhlYXRlcjpDMDEwMg==",
  // "UGC Odéon": "VGhlYXRlcjpDMDEwNA==",
  "UGC Gobelins": "VGhlYXRlcjpDMDE1MA==",
  "Le Grand Action": "VGhlYXRlcjpDMDA3Mg==",
};

export const getAllCinemas = () =>
  _.sortBy(Object.keys(cinemaIds), (s) => s.toLocaleLowerCase());

const FIND_THEATER_ID = gql`
  query ($name: String) {
    theaterList(search: $name) {
      edges {
        node {
          id
          internalId
          name
          location {
            city
            zip
          }
        }
      }
    }
  }
`;

export const findTheaterId = async (name) => {
  const client = new GraphQLClient("https://graph.allocine.fr/v1/public", {
    headers: { Authorization: process.env.ALLOCINE_TOKEN },
  });
  const data = await client.request(FIND_THEATER_ID, {
    name,
  });

  const results = [];
  for (const edge of data.theaterList.edges) {
    results.push(edge.node);
  }
  return results;
};

const GET_THEATER_SHOWTIMES = gql`
  query ($theater: String, $from: DateTime, $to: DateTime) {
    movieShowtimeList(theater: $theater, from: $from, to: $to, first: 100) {
      totalCount
      edges {
        node {
          movie {
            internalId
            title
            runtime
            data {
              productionYear
            }
            stats {
              userRating {
                score
              }
              pressReview {
                score
              }
            }
          }
          showtimes {
            startsAt
            diffusionVersion
          }
        }
      }
    }
  }
`;

const _fetchMovies = async (cinema, date) => {
  const client = new GraphQLClient("https://graph.allocine.fr/v1/public", {
    headers: { Authorization: process.env.ALLOCINE_TOKEN },
  });
  const data = await client.request(GET_THEATER_SHOWTIMES, {
    theater: cinemaIds[cinema],
    from: date.toISOString(),
    to: add(date, { days: 1 }).toISOString(),
  });

  const movies = {};
  for (const edge of data.movieShowtimeList.edges) {
    if (edge.node.showtimes.length === 0 || edge.node.movie == null) {
      continue;
    }

    const movie = edge.node.movie;
    const title = movie.title;
    const details = {
      allocineId: movie.internalId,
      year: movie.data?.productionYear,
      duration: movie.runtime
        ? formatDuration(parseDuration(movie.runtime))
        : "N/A",
      userRating: movie.stats?.userRating?.score,
      pressRating: movie.stats?.pressReview?.score,
      showtimes: {
        [cinema]: edge.node.showtimes.map((s) => ({
          startsAt: dateFnsTz.zonedTimeToUtc(s.startsAt, "Europe/Paris"),
          version: s.diffusionVersion,
        })),
      },
    };
    movies[title] = details;
  }
  return movies;
};

/**
 * @type {(cinema: string, date: Date) => Record<string, any>}
 */
export const fetchMovies = cache()(_fetchMovies);

export const allMovies = async (cinemas, date, scAuthToken) => {
  const movies = {};

  for (const cinema of cinemas) {
    let cinemaMovies = {};
    if (cinema in cinemaIds) {
      cinemaMovies = _.cloneDeep(await fetchMovies(cinema, date));
    } else {
      console.warn(`Cinema not found '${cinema}'`);
      continue;
    }

    _.forEach(cinemaMovies, (details, title) => {
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
    allTitles.map((title) => search(title, movies[title].year, scAuthToken))
  );
  _.zip(allTitles, scData).forEach(([title, data]) => {
    movies[title] = {
      ...movies[title],
      sensCritiqueRating: data.rating,
      sensCritiqueUrl: data.url,
    };
  });

  return movies;
};

export const allMoviesSorted = async (cinemas, date, scAuthToken) => {
  const moviesMap = await allMovies(cinemas, date, scAuthToken);
  const movies = Object.entries(moviesMap).map(([title, details]) => ({
    title,
    ...details,
  }));
  return _.orderBy(
    movies,
    (m) => {
      return [m.sensCritiqueRating ?? 0, m.userRating ?? 0, m.pressRating ?? 0];
    },
    [("desc", "desc", "desc")]
  );
};
