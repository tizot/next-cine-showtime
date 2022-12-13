import _ from "lodash";
import { GraphQLClient, gql } from "graphql-request";

import { cache } from "../cache.js";

const GET_SENSCRITIQUE_RATING = gql`
  query Search($title: String!) {
    searchResult(keywords: $title, limit: 10) {
      results {
        universe
        products_list {
          title
          rating
          url
        }
      }
    }
  }
`;

const _clean = (s) => {
  return _.deburr(
    s
      .toLocaleLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s/g, "")
  );
};

export const _search = async (title, scAuthToken) => {
  const client = new GraphQLClient("https://gql.senscritique.com/graphql", {
    headers: { Authorization: scAuthToken },
  });
  const data = await client.request(GET_SENSCRITIQUE_RATING, { title });
  const movies = data.searchResult.results.find(
    (p) => p.universe == "movie"
  ) ?? { products_list: [] };
  const match = movies.products_list.find(
    (m) => _clean(m.title) == _clean(title)
  );
  if (!match) {
    return { rating: null, url: null };
  }
  const rating = parseFloat(match["rating"]);
  if (_.isNaN(rating)) {
    return { rating: null, url: null };
  }
  return { rating, url: match["url"] };
};

/**
 * @type {(title: string) => {rating: number, url: string} | {rating: null, url: null}}
 */
export const search = cache()(_search);
