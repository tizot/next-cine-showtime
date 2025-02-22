import { GraphQLClient, gql } from 'graphql-request';
import { deburr } from 'lodash-es';
import auth from './auth';
import { cache } from '../cache';
import { SENS_CRITIQUE_KV_PREFIX } from '../constants';

type GqlSensCritiqueRating = {
  searchResult: {
    results: Array<{
      universe: string;
      products_list: Array<{
        title: string;
        year_of_production: number;
        rating: string;
        url: string;
      }>;
    }>;
  };
};

const GET_SENSCRITIQUE_RATING = gql`
  query Search($title: String!) {
    searchResult(keywords: $title, limit: 50, universe: "movie") {
      results {
        universe
        products_list {
          title
          year_of_production
          rating
          url
        }
      }
    }
  }
`;

const _clean = (s: string) => {
  return deburr(s.toLocaleLowerCase())
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s/g, '');
};

const _removeStopWords = (s: string) => {
  return s.replace(/\b(?:le|la|les|un|une|des|du|de|d'|l')\b/g, '');
};

const _extractMovies = (results: GqlSensCritiqueRating) => {
  return results.searchResult.results.find((p) => p.universe == 'movie')?.products_list ?? [];
};

export async function _fetchSensCritiqueRating(title: string, year: number) {
  const token = await auth().getToken();
  const client = new GraphQLClient('https://gql.senscritique.com/graphql', {
    headers: { Authorization: token },
  });
  const resultsWithStopWords: GqlSensCritiqueRating = await client.request(
    GET_SENSCRITIQUE_RATING,
    { title },
  );
  const resultsWithoutStopWords: GqlSensCritiqueRating = await client.request(
    GET_SENSCRITIQUE_RATING,
    { title: _removeStopWords(title) },
  );
  const movies = [
    ..._extractMovies(resultsWithStopWords),
    ..._extractMovies(resultsWithoutStopWords),
  ];
  const match = movies.find(
    // Sometimes, SensCritique says the movie is from 2021 but Allocine says it is from 2022.
    // Since it is highly unlikely that two different movies with the same name are produced
    // less than 2 years apart, this condition is enough.
    (m) => Math.abs(m.year_of_production - year) <= 2 && _clean(m.title) === _clean(title),
  );
  if (!match) {
    console.warn('No SensCritique rating found', { title, year });
    return { rating: null, url: null };
  }
  const rating = parseFloat(match['rating']);
  if (isNaN(rating)) {
    console.warn('Invalid SensCritique rating', { title, year, rating: match['rating'] });
    return { rating: null, url: null };
  }
  return { rating, url: match['url'] };
}

export const fetchSensCritiqueRating = (title: string, year: number) => {
  const context = { title, year };
  return cache(`${SENS_CRITIQUE_KV_PREFIX}:${title}:${year}`, async () => {
    console.log('Fetching SensCritique rating ', context);
    try {
      return await _fetchSensCritiqueRating(title, year);
    } catch (error: any) {
      console.error('Error fetching SensCritique rating', {
        ...context,
        error: JSON.stringify(error),
      });
      throw error;
    }
  });
};
