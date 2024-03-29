import utils, { Utils } from './utils';
import testUtils from '../utils/test-utils';

it('should execute promises sequentially', async () => {
  const sleeps = [1000, 100, 10];
  const observed: number[] = [];

  let i = 0;

  const snooze = async (ms: number) => {
    await testUtils.timeout(ms);
    observed.push(ms);
    return i++ === 1 ? undefined : ms;
  };

  const results = await utils.sequential(sleeps, async (ms) => {
    return await snooze(ms);
  });

  expect(observed).toEqual(sleeps);

  expect(results).toEqual([1000, 10]);
});

it('should create where from search string', () => {
  const attrs = ['attr1', 'attr2'];

  expect(utils.toWhereFromSearchString(attrs, '   ')).toBeNull();

  expect(utils.toWhereFromSearchString(attrs, 'word1 word2   word3')).toEqual({
    $and: [
      {
        $or: [
          {
            attr1: {
              $iLike: 'word1%',
            },
          },
          {
            attr2: {
              $iLike: 'word1%',
            },
          },
        ],
      },
      {
        $or: [
          {
            attr1: {
              $iLike: 'word2%',
            },
          },
          {
            attr2: {
              $iLike: 'word2%',
            },
          },
        ],
      },
      {
        $or: [
          {
            attr1: {
              $iLike: 'word3%',
            },
          },
          {
            attr2: {
              $iLike: 'word3%',
            },
          },
        ],
      },
    ],
  });
});

it('should detect if in browser', () => {
  class TestUtils extends Utils {
    setGlobal(global: typeof globalThis) {
      this._global = global;
    }
  }

  const utils = new TestUtils();
  utils.setGlobal({
    window: true,
  } as unknown as typeof globalThis);

  expect(utils.inBrowser()).toEqual(true);

  utils.setGlobal({} as unknown as typeof globalThis);
  expect(utils.inBrowser()).toEqual(false);
});

it('should combine wheres', () => {
  const where1 = {
    foo: 'bar',
  };
  const where2 = {
    baz: {
      $ne: 'yaz',
    },
  };
  const combined = utils.combineWheres(where1, where2);
  expect(combined).toEqual({
    $and: [where1, where2],
  });

  expect(utils.combineWheres(where1, null)).toEqual(where1);
  expect(utils.combineWheres(null, where2)).toEqual(where2);
});

it('should convert to RegExp', () => {
  const items = ['/[1-9]AB/i', '/[1-9]AB/', '/\\/[1-9]AB\\//', /[1-9]AB/i];
  items.forEach((item) =>
    expect(utils.toRegExp(item).toString()).toEqual(item.toString())
  );

  expect(utils.isRegExpString('/[1-9]AB/i')).toEqual(true);
  expect(utils.isRegExpString('/[1-9]AB/')).toEqual(true);
  expect(utils.isRegExpString('(')).toEqual(false);
});

it('difference should subtract arrays', () => {
  expect(utils.difference(['a', 'b'], ['a'])).toEqual(['b']);
});

it('each should handle falsy values', () => {
  const onItem = jest.fn();

  utils.each(null, onItem);
  expect(onItem).toHaveBeenCalledTimes(0);

  utils.each(undefined, onItem);
  expect(onItem).toHaveBeenCalledTimes(0);
});

it('get should handle falsy object', () => {
  expect(utils.get(null, 'nope')).toEqual(undefined);
});

it('should merge arrays', () => {
  expect(utils.merge({ c: ['a'] }, { c: ['b'] })).toEqual({ c: ['a', 'b'] });
});

it('should orderBy', () => {
  const fred48 = { user: 'fred', age: 48 };
  const barney34 = { user: 'barney', age: 34 };
  const fred40 = { user: 'fred', age: 40 };
  const barney36 = { user: 'barney', age: 36 };
  const users = [fred48, barney34, fred40, barney36];
  const clonedUsers = utils.clone(users);

  expect(utils.orderBy(users, ['user'])).toEqual([
    barney34,
    barney36,
    fred48,
    fred40,
  ]);

  expect(utils.orderBy(users, ['user'], ['asc'])).toEqual([
    barney34,
    barney36,
    fred48,
    fred40,
  ]);

  expect(utils.orderBy(users, ['user'], ['desc'])).toEqual([
    fred48,
    fred40,
    barney34,
    barney36,
  ]);

  expect(utils.orderBy(users, ['user', 'age'])).toEqual([
    barney34,
    barney36,
    fred40,
    fred48,
  ]);

  expect(utils.orderBy(users, ['age'])).toEqual([
    barney34,
    barney36,
    fred40,
    fred48,
  ]);

  expect(utils.orderBy(users, ['user', 'age'], ['asc', 'desc'])).toEqual([
    barney36,
    barney34,
    fred48,
    fred40,
  ]);

  expect(utils.orderBy(users, ['user', 'age'], ['desc', 'asc'])).toEqual([
    fred40,
    fred48,
    barney34,
    barney36,
  ]);

  // Ensure original users are not mutated
  expect(users).toEqual(clonedUsers);
});

it('should set', () => {
  const a = {};
  const a1 = utils.set(a, 'foo', 'bar');
  expect(a).toEqual({ foo: 'bar' });
  expect(a1).toEqual({ foo: 'bar' });

  const b: string[] = [];
  utils.set(b, 0, 'bar');
  expect(b).toEqual(['bar']);

  const c = null;
  utils.set(c, 'foo', 'bar');
  expect(c).toEqual(null);

  const d = { foo: { bar: 1 } };
  utils.set(d, 'foo.bar', 2);
  expect(d).toEqual({ foo: { bar: 2 } });

  const e = {};
  utils.set(e, 'foo.bar', 'yar');
  expect(e).toEqual({ foo: { bar: 'yar' } });
});

it('isEmpty should identify empty objects', () => {
  expect(utils.isEmpty({})).toEqual(true);
  expect(utils.isEmpty([])).toEqual(true);
  expect(utils.isEmpty(null)).toEqual(true);
  expect(utils.isEmpty(undefined)).toEqual(true);
});

it('stringToRegExp should convert to reg exp', () => {
  expect(utils.stringToRegExp('/[A-Z]/i')).toEqual(RegExp('[A-Z]', 'i'));
  expect(utils.stringToRegExp('/\\w/')).toEqual(RegExp('\\w'));
  expect(() => utils.stringToRegExp('a')).toThrow('string must in the form');
});
