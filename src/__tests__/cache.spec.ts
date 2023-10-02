import { cache } from '$lib/server/cache';
import { expect, test } from 'vitest';

test('simple function', async () => {
  let index = 0;
  const _fun = (s: string) => {
    s;
    return Promise.resolve(++index);
  };
  const fun = cache(_fun, 1_000);

  // Test cache
  expect(await fun('foo')).toBe(1);
  expect(await fun('foo')).toBe(1);
  expect(await fun('foo')).toBe(1);

  expect(await fun('bar')).toBe(2);
  expect(await fun('bar')).toBe(2);

  // Test evictAll
  fun.evictAll();

  expect(await fun('foo')).toBe(3);
  expect(await fun('bar')).toBe(4);

  // Test ttl
  fun.evictAll();

  expect(await fun('foo')).toBe(5);
  expect(await fun('foo')).toBe(5);
  setTimeout(async () => expect(await fun('foo')).toBe(6), 1_200);
});

test('multiple arguments', async () => {
  let index = 0;
  const _fun = async (s: string[], d: Date) => {
    [s, d];
    return Promise.resolve(++index);
  };
  const fun = cache(_fun, 1_000);

  const d1 = new Date('2022-09-30');
  const d2 = new Date('2023-01-01');

  // Test cache
  expect(await fun(['foo', 'bar'], d1)).toBe(1);
  expect(await fun(['foo', 'bar'], d1)).toBe(1);

  expect(await fun(['bar'], d2)).toBe(2);
  expect(await fun(['bar'], d2)).toBe(2);

  // Test evictAll
  fun.evictAll();

  expect(await fun(['foo', 'bar'], d1)).toBe(3);
  expect(await fun(['bar'], d2)).toBe(4);
});

test('similar multiple arguments', async () => {
  let index = 0;
  const _fun = (s: string[], d: Date) => {
    [s, d];
    return Promise.resolve(++index);
  };
  const fun = cache(_fun, 1_000);

  const d = new Date('2022-09-30');

  // Test cache
  expect(await fun(['foo', 'bar'], d)).toBe(1);
  expect(await fun(['foo'], d)).toBe(2);
  expect(await fun(['foo', 'bar'], d)).toBe(1);
  expect(await fun(['foo'], d)).toBe(2);

  // Test evictAll
  fun.evictAll();

  expect(await fun(['foo', 'bar'], d)).toBe(3);
  expect(await fun(['bar'], d)).toBe(4);
});
