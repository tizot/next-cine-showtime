import type { DiffusionVersion, Movies, TheaterId } from '$lib/types';
import { GraphQLClient, gql } from 'graphql-request';
import { parse as parseGql } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { theaterIds } from '$lib/theaters';
import { addDays, format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { parse as parseDuration } from 'iso8601-duration';
import { formatDuration } from '$lib/utils';
import { ALLOCINE_TOKEN } from '$env/static/private';
import { cache } from '../cache';

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
    headers: { Authorization: `Bearer ${ALLOCINE_TOKEN}` }, // TODO: check that env is properly set
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
      userRating: movie.stats?.userRating?.score,
      pressRating: movie.stats?.pressReview?.score,
      showtimes: {
        [theater]: edge.node.showtimes.map((s) => ({
          startsAt: zonedTimeToUtc(s.startsAt, 'Europe/Paris'),
          version: s.diffusionVersion,
        })),
      },
    };
    movies[title] = details;
  }
  return movies;
}

export const fetchMovies = (theater: TheaterId, date: Date) =>
  cache(`movies-${theater}-${format(date, 'yyyy-MM-dd')}`, () => _fetchMovies(theater, date));
