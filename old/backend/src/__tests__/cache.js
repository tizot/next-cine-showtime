import test from "ava";

import { cache } from "../cache.js";

test("simple function", (t) => {
  let index = 0;
  const _fun = () => ++index;
  const fun = cache(1_000)(_fun);

  // Test cache
  t.is(fun("foo"), 1);
  t.is(fun("foo"), 1);

  t.is(fun("bar"), 2);
  t.is(fun("bar"), 2);

  // Test evictAll
  fun.evictAll();

  t.is(fun("foo"), 3);
  t.is(fun("bar"), 4);

  // Test ttl
  fun.evictAll();

  t.is(fun("foo"), 5);
  t.is(fun("foo"), 5);
  setTimeout(() => t.is(fun("foo"), 6), 1_200);
});

test("multiple arguments", (t) => {
  let index = 0;
  const _fun = () => ++index;
  const fun = cache(1_000)(_fun);

  const d1 = new Date("2022-09-30");
  const d2 = new Date("2023-01-01");

  // Test cache
  t.is(fun(["foo", "bar"], d1), 1);
  t.is(fun(["foo", "bar"], d1), 1);

  t.is(fun(["bar"], d2), 2);
  t.is(fun(["bar"], d2), 2);

  // Test evictAll
  fun.evictAll();

  t.is(fun(["foo", "bar"], d1), 3);
  t.is(fun(["bar"], d2), 4);
});

test("similar multiple arguments", (t) => {
  let index = 0;
  const _fun = () => ++index;
  const fun = cache(1_000)(_fun);

  const d = new Date("2022-09-30");

  // Test cache
  t.is(fun(["foo", "bar"], d), 1);
  t.is(fun(["foo"], d), 2);
  t.is(fun(["foo", "bar"], d), 1);
  t.is(fun(["foo"], d), 2);

  // Test evictAll
  fun.evictAll();

  t.is(fun(["foo", "bar"], d), 3);
  t.is(fun(["bar"], d), 4);
});
