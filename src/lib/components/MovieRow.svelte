<script lang="ts">
  import { size } from 'lodash-es';
  import type { Movie } from '../types';
  import { formatInTimeZone } from 'date-fns-tz';

  export let movie: Movie;
  $: theatersCount = size(movie.showtimes);
</script>

<tbody>
  {#each Object.entries(movie.showtimes) as [theater, times], idx}
    <tr class="movie">
      {#if idx === 0}
        <td rowspan={theatersCount}>
          <a
            href="https://www.allocine.fr/film/fichefilm_gen_cfilm={movie.allocineId}.html"
            target="_blank">
            {movie.title}
          </a>
        </td>
        <td rowspan={theatersCount}>{movie.duration}</td>
        <td rowspan={theatersCount}>
          {#if movie.sensCritiqueRating}
            <a href={`https://www.senscritique.com${movie.sensCritiqueUrl}`} target="_blank">
              {movie.sensCritiqueRating}
            </a>
          {:else}{'-'}
          {/if}
        </td>
        <td rowSpan={theatersCount}>
          {#if movie.userRating}
            <a
              href={`https://www.allocine.fr/film/fichefilm_gen_cfilm=${movie.allocineId}.html`}
              target="_blank">
              {movie.userRating}
            </a>
          {:else}
            -
          {/if}
        </td>
        <td rowSpan={theatersCount}>
          {#if movie.pressRating}
            <a
              href={`https://www.allocine.fr/film/fichefilm-${movie.allocineId}/critiques/presse/`}
              target="_blank">
              {movie.pressRating}
            </a>
          {:else}
            -
          {/if}
        </td>
      {/if}
      <td>{theater}</td>
      <td>
        {times
          .map(
            (t) =>
              `${formatInTimeZone(t.startsAt, 'Europe/Paris', 'HH:mm')}${
                t.version === 'DUBBED' ? ' (VF)' : ''
              }`,
          )
          .join(' - ')}
      </td>
    </tr>
  {/each}
</tbody>

<style>
  tbody:nth-child(even) {
    background: var(--table-row-stripped-background-color);
  }

  tr {
    white-space: nowrap;
  }

  td > a {
    color: var(--color-secondary);
  }
</style>
