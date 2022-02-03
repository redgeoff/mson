import {
  deepCloneWith,
  deepClone,
  cloneDeepWith,
  cloneDeep,
  Key,
} from './deep-clone';

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

it('should clone functions', () => {
  const arrowFun = () => 'bar';
  const fun = function () {
    return 'bar';
  };
  const object = {
    arrowFun,
    fun,
  };
  const clonedObject = deepClone(object);
  expect(object.arrowFun()).toEqual('bar');
  expect(object.fun()).toEqual('bar');
  expect(clonedObject.arrowFun()).toEqual('bar');
  expect(clonedObject.fun()).toEqual('bar');
});

it('should clone classes', () => {
  class MyClass {
    foo() {
      return 'bar';
    }
  }
  const object = new MyClass();
  const clonedObject = deepClone(object);
  expect(object.foo()).toEqual('bar');
  expect(clonedObject.foo()).toEqual('bar');
});

it('should clone classes with nested data', () => {
  class MyClass {
    items: string[] = [];

    add(item: string) {
      this.items.push(item);
    }
  }
  const object = new MyClass();
  object.add('foo');
  const clonedObject = deepClone(object);
  clonedObject.add('bar');
  expect(clonedObject.items).toEqual(['foo', 'bar']);

  // Make sure original items didn't change
  expect(object.items).toEqual(['foo']);
});

it('should deep clone complex object', () => {
  const fun1 = () => {};
  const fun2 = () => {};
  const object = { foo: ['bar'], fun: fun1 };
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({ foo: ['bar'], fun: fun1 });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.foo.push('buzz');
  clonedObject.fun = fun2;
  expect(object).toEqual({ foo: ['bar'], fun: fun1 });
  clonedObject.bar = 'nar';
  expect(object).toEqual({ foo: ['bar'], fun: fun1 });
});

it('should deep clone nested null and undefined', () => {
  const object = { foo: ['bar'], fizz: null, buzz: undefined };
  const clonedObject = deepClone(object);
  expect(clonedObject).toEqual({ foo: ['bar'], fizz: null, buzz: undefined });
});

it('should deep clone when circular references', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const object: any = { foo: ['bar'] };
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
  const onNode = (object: object, key: Key) => {
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

it('should clone deep with conditional customizer', () => {
  const customizer = (object: object, key: Key) => {
    if (key === 'foo') {
      // Don't actually clone
      return object;
    }
  };

  const object = { foo: ['bar'] };
  const clonedObject = cloneDeepWith(object, customizer);
  expect(clonedObject).toEqual({ foo: ['bar'] });

  // Mutate clone and make sure it doesn't change the original
  clonedObject.bar = 'nar';
  expect(object).toEqual({ foo: ['bar'] });

  // Mutate the part that wasn't actually cloned and make sure the original changes
  clonedObject.foo.push('buzz');
  expect(object).toEqual({ foo: ['bar', 'buzz'] });
});

// Just a sanity check as the coverage is handled via the deepClone tests
it('should clone deep object', () => {
  const object = { foo: 'bar' };
  const clonedObject = cloneDeep(object);
  expect(clonedObject).toEqual({ foo: 'bar' });
});

// NOTE: Do not remove this comment as it provides useful context
//
// Benchmark with N=100000:
// - cloneDeepWith: 574ms
// - deepCloneWith: 219ms
// Summary: deepCloneWith() is more than 2 times faster than Lodash's cloneDeepWith()!
//
// import lodashCloneDeepWith from 'lodash/cloneDeepWith';
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
// it.only('should cloneDeepWith quickly', () => {
//   for (let i = 0; i < N; i++) {
//     lodashCloneDeepWith(obj, () => undefined);
//   }
// });
//
// it.only('should deepCloneWith quickly', () => {
//   for (let i = 0; i < N; i++) {
//     deepCloneWith(obj, () => ({ performDefaultClone: true }));
//   }
// });
