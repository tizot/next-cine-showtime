import type { RequestHandler } from '@sveltejs/kit';
import { clearCache } from '$lib/server/cache';
import { MOVIES_KV_PREFIX, SENS_CRITIQUE_KV_PREFIX } from '$lib/server/constants';

export const GET: RequestHandler = async () => {
  console.log('Daily cache eviction triggered');

  await Promise.all([clearCache(MOVIES_KV_PREFIX), clearCache(SENS_CRITIQUE_KV_PREFIX)]);

  return new Response('Cache cleared', { status: 200 });
};
