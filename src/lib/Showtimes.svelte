<script lang="ts">
  import { size } from 'lodash';
  import type { Movie } from '$lib/types';
  import MovieRow from './MovieRow.svelte';

  export let movies: Movie[] = [];

  $: movies_ = movies.map((m) => ({ ...m, _theatersCount: size(m.showtimes) }));
</script>

<figure>
  <table>
    <thead>
      <tr>
        <th scope="col">Titre</th>
        <th scope="col">Durée</th>
        <th scope="col">Sens Critique</th>
        <th scope="col">Spectateurs</th>
        <th scope="col">Presse</th>
        <th scope="col">Cinéma</th>
        <th scope="col">Horaires</th>
      </tr>
    </thead>
    {#if movies_.length === 0}
      <tbody>
        <tr><td colspan="7">Aucun film...</td></tr>
      </tbody>
    {:else}
      {#each movies_ as movie} <MovieRow {movie} />{/each}
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
