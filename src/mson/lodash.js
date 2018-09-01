// Lodash with just the pieces needed for mson. This reduces the build size.
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import cloneDeepWith from 'lodash/cloneDeepWith';
import difference from 'lodash/difference';
import each from 'lodash/each';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import merge from 'lodash/merge';
import reduce from 'lodash/reduce';
import snakeCase from 'lodash/snakeCase';

export default {
  clone,
  cloneDeep,
  cloneDeepWith,
  difference,
  each,
  forEach,
  get,
  isEmpty,
  isEqual,
  map,
  merge,
  reduce,
  snakeCase
};
