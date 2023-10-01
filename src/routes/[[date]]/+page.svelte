<script lang="ts">
  import { page } from '$app/stores';
  import Showtimes from '$lib/components/Showtimes.svelte';
  import { dropDubbedShowtimes } from '$lib/utils';
  import type { PageData } from './$types';
  import { addDays, format, isSameDay, startOfToday } from 'date-fns';
  import fr from 'date-fns/locale/fr';
  import { chain, deburr, range } from 'lodash';

  export let data: PageData;
  const today = startOfToday();
  const menuDates = range(0, 8).map((i) => addDays(today, i));

  let form: HTMLFormElement;
  let query = '';
  let hideDubbedShowtimes = true;
  let allTheaters = data.allTheaters;
  let activeTheaters = data.activeTheaters;

  $: activeDate = data.activeDate;
  $: movies = chain(data.movies)
    .filter((m) => deburr(m.title.toLocaleLowerCase()).includes(deburr(query.toLocaleLowerCase())))
    .map((movie) => (hideDubbedShowtimes ? dropDubbedShowtimes(movie) : movie))
    .compact()
    .value();
</script>

<svelte:head>
  <title>
    Ma prochaine séance | Films pour le {format($page.data.activeDate, 'PPPP', {
      locale: fr,
    })}
  </title>
</svelte:head>

<header class="container">
  <h1>Films pour le {format(activeDate, 'PPPP', { locale: fr })}</h1>
</header>

<main class="container">
  <section>
    <div class="dates-menu">
      {#each menuDates as d}
        <a
          href={format(d, 'yyyy-MM-dd')}
          class="menu-link secondary"
          class:active={isSameDay(activeDate, d)}>
          {format(d, 'PPPP', { locale: fr })}
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

  <Showtimes {movies} />
</main>

<footer class="container">Reset cache</footer>

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
</style>
