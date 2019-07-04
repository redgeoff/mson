import JSONStringify from './json-stringify';

const shouldStringify = async space => {
  const jsonStringify = new JSONStringify({
    space
  });

  const obj = {
    foo: 'bar'
  };

  const result = await jsonStringify.act({ arguments: obj });

  expect(result).toEqual(JSON.stringify(obj, null, space));
};

it('should stringify', async () => {
  await shouldStringify();
  await shouldStringify(2);
});
