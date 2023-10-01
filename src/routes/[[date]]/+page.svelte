<script lang="ts">
  import Showtimes from '$lib/Showtimes.svelte';
  import type { PageData } from './$types';
  import { addDays, format, isSameDay, startOfToday } from 'date-fns';
  import fr from 'date-fns/locale/fr';
  import { chain, deburr, range } from 'lodash';

  export let data: PageData;
  const today = startOfToday();
  const menuDates = range(0, 8).map((i) => addDays(today, i));

  let query = '';

  $: activeDate = data.activeDate;
  $: movies = chain(data.movies)
    .filter((m) => deburr(m.title.toLocaleLowerCase()).includes(deburr(query.toLocaleLowerCase())))
    .value();
</script>

<header class="container">
  <h1>Films pour le {format(activeDate, 'PPPP', { locale: fr })}</h1>
</header>

<main class="container">
  <section>
    <div class="menu">
      {#each menuDates as d}
        <a
          href={format(d, 'yyyy-MM-dd')}
          class="menu-link secondary"
          class:active={isSameDay(activeDate, d)}
        >
          {format(d, 'PPPP', { locale: fr })}
        </a>
      {/each}
    </div>
  </section>

  <form>
    <div class="grid">
      <input type="text" bind:value={query} placeholder="Filtrer les films" />
    </div>
  </form>

  <Showtimes {movies} />
</main>

<footer class="container">Reset cache</footer>

<style>
  header {
    margin-top: 2em;
  }

  a.menu-link {
    display: block;
    text-decoration: none;
  }

  a.menu-link.active {
    color: var(--color-contrast);
  }

  @media (min-width: 992px) {
    .menu {
      display: grid;
      grid-template-rows: repeat(4, 1fr);
      grid-auto-flow: column;
      grid-column-gap: 0px;
      grid-row-gap: 0px;
    }
  }
</style>
