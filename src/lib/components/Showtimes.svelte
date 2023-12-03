<script lang="ts">
  import { deburr, orderBy, size } from 'lodash-es';
  import type { Movie } from '$lib/types';
  import MovieRow from './MovieRow.svelte';
  import Fa from 'svelte-fa';
  import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

  export let movies: Movie[] = [];

  type Column = {
    header: string;
    sorter?: keyof Movie | ((movie: Movie) => string) | ((movie: Movie) => number);
    reverseByDefault?: boolean;
  };
  const columns = [
    'title',
    'duration',
    'sensCritiqueRating',
    'userRating',
    'pressRating',
    'cinema',
    'showtimes',
  ] as const;
  type ColumnName = typeof columns[number];

  let sortBy: ColumnName | null = 'sensCritiqueRating';
  let sortDirection: 'asc' | 'desc' = 'desc';

  const columnDefs: Record<ColumnName, Column> = {
    title: { header: 'Titre', sorter: ({ title }) => deburr(title.toLowerCase()) },
    duration: {
      header: 'Durée',
      sorter: 'duration',
      reverseByDefault: true,
    },
    sensCritiqueRating: {
      header: 'Sens Critique',
      sorter: ({ sensCritiqueRating }) =>
        sensCritiqueRating ??
        (sortDirection === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY),
      reverseByDefault: true,
    },
    userRating: {
      header: 'Spectateurs',
      sorter: ({ userRating }) =>
        userRating ??
        (sortDirection === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY),
      reverseByDefault: true,
    },
    pressRating: {
      header: 'Presse',
      sorter: ({ pressRating }) =>
        pressRating ??
        (sortDirection === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY),
      reverseByDefault: true,
    },
    cinema: { header: 'Cinéma' },
    showtimes: { header: 'Horaires' },
  };

  $: sortByColumn = sortBy == null ? null : columnDefs[sortBy];

  function handleOnColumnClick(column: ColumnName) {
    if (sortBy === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else if (columnDefs[column].sorter != null) {
      sortBy = column;
      sortDirection = columnDefs[column].reverseByDefault ? 'desc' : 'asc';
    }
  }

  $: movies_ = movies.map((m) => ({ ...m, _theatersCount: size(m.showtimes) }));
  $: sortedMovies =
    sortByColumn == null || sortByColumn.sorter == null
      ? movies_
      : orderBy(movies_, [sortByColumn.sorter], [sortDirection]);
</script>

<figure>
  <table>
    <thead>
      <tr>
        {#each columns as col}
          <th scope="col" on:click={() => handleOnColumnClick(col)}>
            {columnDefs[col].header}
            {#if sortBy === col}
              <Fa icon={sortDirection === 'asc' ? faSortUp : faSortDown} />
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    {#if sortedMovies.length === 0}
      <tbody>
        <tr><td colspan="7">Aucun film...</td></tr>
      </tbody>
    {:else}
      {#each sortedMovies as movie} <MovieRow {movie} />{/each}
    {/if}
  </table>
</figure>

<style>
  tr {
    text-wrap: nowrap;
  }

  tr th {
    font-weight: 600;
  }
</style>
