import utils from './utils';
import testUtils from './test-utils';

it('should execute promises sequentially', async () => {
  let sleeps = [1000, 100, 10];
  let observed = [];

  const snooze = async ms => {
    await testUtils.timeout(ms);
    observed.push(ms);
  };

  await utils.sequential(sleeps, async ms => {
    await snooze(ms);
  });

  expect(observed).toEqual(sleeps);
});

it('should create where from search string', () => {
  const attrs = ['attr1', 'attr2'];

  expect(utils.toWhereFromSearchString(attrs, '   ')).toBeNull();

  expect(utils.toWhereFromSearchString(attrs, 'word1 word2   word3')).toEqual({
    $or: [
      {
        $and: [
          {
            attr1: {
              $like: 'word1%'
            }
          },
          {
            attr1: {
              $like: 'word2%'
            }
          },
          {
            attr1: {
              $like: 'word3%'
            }
          }
        ]
      },
      {
        $and: [
          {
            attr2: {
              $like: 'word1%'
            }
          },
          {
            attr2: {
              $like: 'word2%'
            }
          },
          {
            attr2: {
              $like: 'word3%'
            }
          }
        ]
      }
    ]
  });
});
