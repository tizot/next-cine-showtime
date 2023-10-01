<script lang="ts">
  import type { PageData } from './$types';
  import { addDays, format, startOfToday } from 'date-fns';
  import fr from 'date-fns/locale/fr';
  import { range } from 'lodash';

  export let data: PageData;
  const today = startOfToday();
  const menuDates = range(0, 8).map((i) => addDays(today, i));

  $: date = data.date;
</script>

<main class="container">
  <h1>Films pour le {format(date, 'PPPP', { locale: fr })}</h1>

  <form>
    <div class="menu">
      {#each menuDates as d}
        <label for={d.toISOString()}
          ><input type="checkbox" id={d.toISOString()} />
          {format(d, 'PPPP', { locale: fr })}</label
        >
      {/each}
    </div>
  </form>
</main>

<footer class="container">Reset cache</footer>

<style>
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
