import { error, type RequestHandler } from '@sveltejs/kit';
import { clearCache } from '$lib/server/cache';
import { MOVIES_KV_PREFIX, SENS_CRITIQUE_KV_PREFIX } from '$lib/server/constants';
import { CRON_SECRET } from '$env/static/private';

export const GET: RequestHandler = async ({ request }) => {
  if (request.headers.get('Authorization') !== `Bearer ${CRON_SECRET}`) {
    error(401, 'Unauthorized');
  }

  console.log('Daily cache eviction triggered');
  await Promise.all([clearCache(MOVIES_KV_PREFIX), clearCache(SENS_CRITIQUE_KV_PREFIX)]);
  return new Response('Cache evicted', { status: 200 });
};
