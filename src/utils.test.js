import utils, { Utils } from './utils';
import testUtils from './test-utils';

it('should execute promises sequentially', async () => {
  let sleeps = [1000, 100, 10];
  let observed = [];

  let i = 0;

  const snooze = async ms => {
    await testUtils.timeout(ms);
    observed.push(ms);
    return i++ === 1 ? undefined : ms;
  };

  const results = await utils.sequential(sleeps, async ms => {
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
              $iLike: 'word1%'
            }
          },
          {
            attr2: {
              $iLike: 'word1%'
            }
          }
        ]
      },
      {
        $or: [
          {
            attr1: {
              $iLike: 'word2%'
            }
          },
          {
            attr2: {
              $iLike: 'word2%'
            }
          }
        ]
      },
      {
        $or: [
          {
            attr1: {
              $iLike: 'word3%'
            }
          },
          {
            attr2: {
              $iLike: 'word3%'
            }
          }
        ]
      }
    ]
  });
});

it('should detect if in browser', () => {
  const utils = new Utils();

  utils._global = {
    window: true
  };

  expect(utils.inBrowser()).toEqual(true);

  delete utils._global.window;
  expect(utils.inBrowser()).toEqual(false);
});

it('should combine wheres', () => {
  const where1 = {
    foo: 'bar'
  };
  const where2 = {
    baz: {
      $ne: 'yaz'
    }
  };
  const combined = utils.combineWheres(where1, where2);
  expect(combined).toEqual({
    $and: [where1, where2]
  });

  expect(utils.combineWheres(where1, null)).toEqual(where1);
  expect(utils.combineWheres(null, where2)).toEqual(where2);
});

it('should convert to RegExp', () => {
  const items = ['/[1-9]AB/i', '/[1-9]AB/', '/\\/[1-9]AB\\//', /[1-9]AB/i];
  items.forEach(item =>
    expect(utils.toRegExp(item).toString()).toEqual(item.toString())
  );

  expect(utils.isRegExpString('/[1-9]AB/i')).toEqual(true);
  expect(utils.isRegExpString('/[1-9]AB/')).toEqual(true);
  expect(utils.isRegExpString('(')).toEqual(false);
});
