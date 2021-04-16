import { deepCloneWith, deepClone } from './deep-clone';

it('should deep clone primitive types', () => {
  expect(deepClone(null)).toEqual(null);
  expect(deepClone(undefined)).toEqual(undefined);
  expect(deepClone(1)).toEqual(1);
  expect(deepClone(1.0)).toEqual(1);
  expect(deepClone('foo')).toEqual('foo');
});

it('should deep clone object', () => {
  const object = { foo: 'bar' };
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({ foo: 'bar' });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.foo = 'buzz';
  clonedObject.bar = 'fizz';
  expect(object).toEqual({ foo: 'bar' });
});

it('should deep clone array', () => {
  const object = ['foo'];
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual(['foo']);

  // Mutate clone and make sure it doesn't change the original
  clonedObject.push('bar');
  expect(object).toEqual(['foo']);
});

it('should deep clone complex object', () => {
  const object = { foo: ['bar'] };
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({ foo: ['bar'] });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.foo.push('buzz');
  expect(object).toEqual({ foo: ['bar'] });
  clonedObject.bar = 'nar';
  expect(object).toEqual({ foo: ['bar'] });
});

it('should deep clone nested null and undefined', () => {
  const object = { foo: ['bar'], fizz: null, buzz: undefined };
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({ foo: ['bar'], fizz: null, buzz: undefined });
});

it('should deep clone when circular references', () => {
  const object = { foo: ['bar'] };
  object.fizz = object;
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({
    foo: ['bar'],
    fizz: object,
  });
});

it('should deep clone with complex object', () => {
  const onNode = (/* object, key */) => ({
    performDefaultClone: true,
    clonedObject: undefined,
  });

  const object = { foo: ['bar'] };
  const clonedObject = deepCloneWith(object, onNode);
  expect(clonedObject).toEqual({ foo: ['bar'] });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.foo.push('buzz');
  expect(object).toEqual({ foo: ['bar'] });
  clonedObject.bar = 'nar';
  expect(object).toEqual({ foo: ['bar'] });
});

it('should deep clone with conditional onNode', () => {
  const onNode = (object, key) => {
    if (key === 'foo') {
      // Don't actually clone
      return {
        performDefaultClone: false,
        clonedObject: object,
      };
    } else {
      return {
        performDefaultClone: true,
      };
    }
  };

  const object = { foo: ['bar'] };
  const clonedObject = deepCloneWith(object, onNode);
  expect(clonedObject).toEqual({ foo: ['bar'] });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.bar = 'nar';
  expect(object).toEqual({ foo: ['bar'] });

  // Mutate the part that wasn't actually cloned and make sure the original changes
  clonedObject.foo.push('buzz');
  expect(object).toEqual({ foo: ['bar', 'buzz'] });
});

// Benchmark with N=100000:
// - cloneDeepWith: 574ms
// - deepCloneWith: 219ms
// Summary: deepCloneWith() is more than 2 times faster than Lodash's cloneDeepWith()!
//
// import cloneDeepWith from 'lodash/cloneDeepWith';
//
// const obj = {
//   foo: {
//     bar: {
//       fizz: ['buzz'],
//     },
//     yar: {
//       rar: {
//         car: 1,
//       },
//     },
//   },
// };
//
// const N = 100000;
//
// it('should cloneDeepWith quickly', () => {
//   for (let i = 0; i < N; i++) {
//     cloneDeepWith(obj, () => undefined);
//   }
// });
//
// it('should deepCloneWith quickly', () => {
//   for (let i = 0; i < N; i++) {
//     deepCloneWith(obj, () => ({ performDefaultClone: true }));
//   }
// });
