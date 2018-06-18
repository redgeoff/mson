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
