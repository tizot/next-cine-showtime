<script lang="ts">
  import { page } from '$app/stores';
  import LoadingBar from '$lib/components/LoadingBar.svelte';
  import Showtimes from '$lib/components/Showtimes.svelte';
  import { filterShowtimes, formatDate } from '$lib/utils';
  import { addDays, format, isSameDay, startOfToday } from 'date-fns';
  import { deburr, range } from 'lodash-es';
  import type { PageData } from './$types';
  import type { Movie } from '$lib/types';

  export let data: PageData;
  const today = startOfToday();
  const menuDates = range(0, 8).map((i) => addDays(today, i));

  let form: HTMLFormElement;
  let query = '';
  let hideDubbedShowtimes = true;
  let allTheaters = data.allTheaters;
  let activeTheaters = data.activeTheaters;

  $: activeDate = data.activeDate;
  $: movies = Promise.resolve(data.deferred.movies).then((movies) =>
    movies
      .map((movie) => filterShowtimes(movie, activeTheaters, hideDubbedShowtimes))
      .filter((movie): movie is Movie => movie != null),
  );
  $: filteredMovies = movies.then((movies) =>
    movies.filter((movie) =>
      deburr(movie.title.toLocaleLowerCase()).includes(deburr(query.toLocaleLowerCase())),
    ),
  );
</script>

<svelte:head>
  <title>
    Ma prochaine séance | Films pour le {formatDate($page.data.activeDate)}
  </title>
</svelte:head>

<LoadingBar />

<header class="container">
  <h1>
    Films pour le {formatDate(activeDate)}
  </h1>
</header>

<main class="container">
  <section>
    <div class="dates-menu">
      {#each menuDates as d}
        <a
          href={format(d, 'yyyy-MM-dd')}
          class="menu-link secondary"
          class:active={isSameDay(activeDate, d)}>
          {formatDate(d)}
        </a>
      {/each}
    </div>
  </section>

  <form method="GET" bind:this={form} data-sveltekit-noscroll data-sveltekit-keepfocus>
    <div class="theaters-form">
      {#each allTheaters as theater}
        <label>
          <input
            type="checkbox"
            bind:group={activeTheaters}
            value={theater}
            name="theater"
            on:change={() => form.requestSubmit()} />
          {theater}
        </label>
      {/each}
    </div>
  </form>

  <form>
    <div class="grid" style:align-items="baseline">
      <input type="text" bind:value={query} placeholder="Filtrer les films" />
      <label for="hide-dubbed-checkbox">
        <input type="checkbox" bind:checked={hideDubbedShowtimes} id="hide-dubbed-checkbox" />
        Masquer les films doublés
      </label>
    </div>
  </form>

  {#await filteredMovies}
    <progress />
  {:then resolvedFilteredMovies}
    <Showtimes movies={resolvedFilteredMovies} />
  {/await}
</main>

<footer class="container">
  <form method="POST">
    <button class="secondary reset">Reset cache</button>
  </form>
</footer>

<style>
  header {
    margin-top: 2em;
  }

  .dates-menu a {
    display: block;
    text-decoration: none;
  }

  .dates-menu a.active {
    color: var(--color-contrast);
  }

  @media (min-width: 992px) {
    .dates-menu {
      display: grid;
      grid-template-rows: repeat(4, 1fr);
      grid-auto-flow: column;
      grid-column-gap: 0px;
      grid-row-gap: 0px;
    }

    .theaters-form {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-auto-flow: row;
      grid-column-gap: 0px;
      grid-row-gap: 0px;
    }
  }

  .reset {
    width: fit-content;
    margin-left: auto;
    margin-right: 0;
  }
</style>
