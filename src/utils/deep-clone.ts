// Highlights:
// - deepCloneWith() is more than 2 times faster than Lodash's cloneDeepWith()! See
//   deep-clone.test.js
// - deepClone() allows undefined values to be cloned, e.g.
//     deepClone({ foo: undefined }) = { foo: undefined }
//   but:
//     cloneDeep({ foo: undefined }) = {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CloneObject = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stack = any;

export type Key = number | string | undefined;

interface DeepCloneResult {
  performDefaultClone: boolean;
  clonedObject?: CloneObject;
}

type DeepCloneWithCustomizer<T> = (
  value: T,
  key: Key,
  object?: CloneObject,
  stack?: Stack
) => DeepCloneResult;

type CloneDeepWithCustomizer<T> = (
  value: T,
  key: Key,
  object?: CloneObject,
  stack?: Stack
) => CloneObject;

const isClass = (object: CloneObject) => {
  return object.constructor && object.constructor.name !== 'Object';
};

function deepCloneWithInner<T>(
  object: CloneObject,
  onNode: DeepCloneWithCustomizer<T> | undefined,
  key: Key,
  stack: Stack
) {
  if (stack.indexOf(object) !== -1) {
    // Bail if we find a circular reference
    return object;
  }

  let doClone = true;
  let clonedVal: CloneObject = object;

  if (onNode) {
    const { performDefaultClone, clonedObject } = onNode(
      object,
      key,
      object,
      stack
    );
    doClone = performDefaultClone;
    if (!doClone) {
      clonedVal = clonedObject;
    }
  }

  if (doClone) {
    if (object === null) {
      return null;
    } else if (Array.isArray(object)) {
      stack.push(object);
      clonedVal = object.map((value, key) =>
        deepCloneWithInner(value, onNode, key, stack)
      );
      stack.pop();
    } else if (typeof object === 'object') {
      stack.push(object);

      if (isClass(object)) {
        // Note: this works for both classes and other objects, but it is much slower than `clonedVal = {}`
        clonedVal = Object.assign(
          Object.create(Object.getPrototypeOf(object)),
          object
        );
      } else {
        clonedVal = {};
      }

      for (const key in object) {
        clonedVal[key] = deepCloneWithInner(object[key], onNode, key, stack);
      }
      stack.pop();
    }
  }

  return clonedVal;
}

export function deepCloneWith<T>(
  object: CloneObject,
  onNode: DeepCloneWithCustomizer<T>
) {
  return deepCloneWithInner(object, onNode, undefined, []);
}

export const deepClone = (object: CloneObject) =>
  deepCloneWithInner(object, undefined, undefined, []);

// Drop-in replacement for Lodash's cloneDeepWith()
export function cloneDeepWith<T>(
  object: CloneObject,
  customizer: CloneDeepWithCustomizer<T>
) {
  return deepCloneWith<T>(object, (value, key, object, stack) => {
    const clonedObject = customizer(value, key, object, stack);
    if (clonedObject === undefined) {
      return {
        performDefaultClone: true,
      };
    } else {
      return {
        performDefaultClone: false,
        clonedObject,
      };
    }
  });
}

// Drop-in replacement for Lodash's cloneDeep()
export const cloneDeep = (object: CloneObject) => deepClone(object);
