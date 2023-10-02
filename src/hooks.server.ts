import { fetchMovies } from '$lib/server/allocine/movies';
import { fetchSensCritiqueRating } from '$lib/server/sens-critique';
import { CronJob } from 'cron';
import { toString as cronToString } from 'cronstrue';

const cronTime = '0 0 */6 * * *';
const dailyCacheEviction = new CronJob(
  cronTime,
  () => {
    console.log('Daily cache eviction');
    fetchMovies.evictAll();
    fetchSensCritiqueRating.evictAll();
  },
  null, // onComplete
  false, // start
  'Europe/Paris',
);
dailyCacheEviction.start();
console.log(
  `Daily cache eviction setup ${cronToString(cronTime, {
    use24HourTimeFormat: true,
    verbose: true,
  }).toLowerCase()} (Paris time)`,
);
