import type { DiffusionVersion, Movies, TheaterId } from '$lib/types';
import { GraphQLClient, gql } from 'graphql-request';
import { parse as parseGql } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { theaterIds } from '$lib/theaters';
import { addDays, format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { parse as parseDuration } from 'iso8601-duration';
import { formatDuration } from '$lib/utils';
import { env } from '$env/dynamic/private';
import { cache } from '../cache';
import { MOVIES_KV_PREFIX } from '../constants';

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
            genres
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

const GENRES = {
  ACTION: 'Action',
  ADVENTURE: 'Aventure',
  ANIMATION: 'Animation',
  BIOPIC: 'Biopic',
  BOLLYWOOD: 'Bollywood',
  CARTOON: 'Dessin animé',
  CLASSIC: 'Classique',
  COMEDY: 'Comédie',
  COMEDY_DRAMA: 'Comédie dramatique',
  CONCERT: 'Concert',
  DETECTIVE: 'Policier',
  DIVERS: 'Divers',
  DOCUMENTARY: 'Documenataire',
  DRAMA: 'Drame',
  EROTIC: 'Érotique',
  EXPERIMENTAL: 'Expérimental',
  FAMILY: 'Famille',
  FANTASY: 'Fantastique',
  HISTORICAL: 'Historique',
  HISTORICAL_EPIC: 'Péplum',
  HORROR: 'Épouvante-horreur',
  JUDICIAL: 'Judiciaire',
  KOREAN_DRAMA: 'Drame',
  MARTIAL_ARTS: 'Arts martiaux',
  MEDICAL: 'Médical',
  MOBISODE: 'Mobisode',
  MOVIE_NIGHT: 'Movie night',
  MUSIC: 'Musique',
  MUSICAL: 'Comédie musicale',
  OPERA: 'Opéra',
  ROMANCE: 'Romance',
  SCIENCE_FICTION: 'Science-fiction',
  PERFORMANCE: 'Spectacle',
  SOAP: 'Feuilleton',
  SPORT_EVENT: 'Événement sportif',
  SPY: 'Espionnage',
  THRILLER: 'Thriller',
  WARMOVIE: 'Guerre',
  WEB_SERIES: 'Web séries',
  WESTERN: 'Western',
};

// TODO: generate this type with code-gen
type GqlTheaterShowtimes = {
  movieShowtimeList: {
    totalCount: number;
    edges: Array<{
      node: {
        movie: {
          internalId: string;
          title: string;
          runtime: string;
          genres: Array<keyof typeof GENRES>;
          data: {
            productionYear: number;
          };
          stats: {
            userRating: {
              score: number | undefined;
            };
            pressReview: {
              score: number | undefined;
            };
          };
        };
        showtimes: Array<{
          startsAt: string;
          diffusionVersion: DiffusionVersion;
        }>;
      };
    }>;
  };
};

export async function _fetchMovies(theater: TheaterId, date: Date) {
  const client = new GraphQLClient('https://graph.allocine.fr/v1/public', {
    headers: { Authorization: `Bearer ${env.ALLOCINE_TOKEN}` }, // TODO: check that env is properly set
  });
  const query: TypedDocumentNode<GqlTheaterShowtimes> = parseGql(GET_THEATER_SHOWTIMES);
  const data = await client.request(query, {
    theater: theaterIds[theater],
    from: date.toISOString(),
    to: addDays(date, 1).toISOString(),
  });

  const movies: Movies = {};
  for (const edge of data.movieShowtimeList.edges) {
    if (edge.node.showtimes.length === 0 || edge.node.movie == null) {
      continue;
    }

    const movie = edge.node.movie;
    const title = movie.title;
    const details = {
      title,
      allocineId: movie.internalId,
      year: movie.data?.productionYear,
      duration: movie.runtime ? formatDuration(parseDuration(movie.runtime)) : 'N/A',
      genres: movie.genres?.slice(0, 2)?.map((g) => GENRES[g] ?? g) ?? [],
      userRating: movie.stats?.userRating?.score,
      pressRating: movie.stats?.pressReview?.score,
      showtimes: {
        [theater]: edge.node.showtimes.map((s) => ({
          startsAt: fromZonedTime(s.startsAt, 'Europe/Paris'),
          version: s.diffusionVersion,
        })),
      },
    };
    movies[title] = details;
  }
  return movies;
}

export const fetchMovies = (theater: TheaterId, date: Date) => {
  const context = { theater, date: format(date, 'yyyy-MM-dd') };
  return cache(`${MOVIES_KV_PREFIX}:${theater}:${context.date}`, async () => {
    console.log('Fetching movies for theater', context);
    try {
      return await _fetchMovies(theater, date);
    } catch (error: any) {
      console.error('Error fetching movies', { ...context, error: JSON.stringify(error) });
      throw error;
    }
  });
};
