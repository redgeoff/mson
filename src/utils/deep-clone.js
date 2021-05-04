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

      // Note: this works for both classes and other objects
      clonedVal = Object.assign(
        Object.create(Object.getPrototypeOf(object)),
        object
      );

      for (let key in object) {
        clonedVal[key] = deepCloneWithInner(object[key], onNode, key, stack);
      }
      stack.pop();
    }
  }

  return clonedVal;
};

export const deepCloneWith = (object, onNode) =>
  deepCloneWithInner(object, onNode, undefined, []);

export const deepClone = (object) =>
  deepCloneWithInner(object, undefined, undefined, []);

// Drop-in replacement for Lodash's cloneDeepWith()
export const cloneDeepWith = (object, customizer) =>
  deepCloneWith(object, (value, key, object, stack) => {
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

// Drop-in replacement for Lodash's cloneDeep()
export const cloneDeep = (object) => deepClone(object);
