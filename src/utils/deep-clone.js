// Highlights:
// - deepCloneWith() is more than 2 times faster than Lodash's cloneDeepWith()! See
//   deep-clone.test.js
// - deepClone() allows undefined values to be cloned, e.g.
//     deepClone({ foo: undefined }) = { foo: undefined }
//   but:
//     cloneDeep({ foo: undefined }) = {}

const deepCloneWithInner = (object, onNode, key, stack) => {
  if (stack.indexOf(object) !== -1) {
    // Bail if we find a circular reference
    return object;
  }

  let doClone = true;
  let clonedVal = object;

  if (onNode) {
    const { performDefaultClone, clonedObject } = onNode(object, key);
    doClone = performDefaultClone;
    if (!doClone) {
      clonedVal = clonedObject;
    }
  }

  if (doClone) {
    if (object === null) {
      return null;
    } else if (Array.isArray(object)) {
      clonedVal = object.map((value, key) =>
        deepCloneWithInner(value, onNode, key, [...stack, object])
      );
    } else if (typeof object === 'object') {
      clonedVal = {};
      for (let key in object) {
        clonedVal[key] = deepCloneWithInner(object[key], onNode, key, [
          ...stack,
          object,
        ]);
      }
    }
  }

  return clonedVal;
};

export const deepCloneWith = (object, onNode) =>
  deepCloneWithInner(object, onNode, undefined, []);

export const deepClone = (object) =>
  deepCloneWithInner(object, undefined, undefined, []);
