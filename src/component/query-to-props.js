import forEach from 'lodash/forEach';
import set from 'lodash/set';
import PropertyNotDefinedError from './property-not-defined-error';

export const queryToPropNames = (query, names, parentName) => {
  if (query !== null && typeof query === 'object') {
    if (Array.isArray(query)) {
      query.forEach((item) => queryToPropNames(item, names, parentName));
    } else {
      forEach(query, (item, name) => {
        let itemParentName = parentName;

        // Not operator? TODO: actually check operators so that we support variables that begin with
        // $
        if (name.charAt(0) !== '$') {
          itemParentName =
            parentName === undefined ? name : parentName + '.' + name;
        }

        if (name === '$elemMatch') {
          // We want to set the parent item and then skip the rest of the current tree so that the
          // query can scan the entire array. We cannot determine which array element will be chosen
          // until the query is run.
          names[itemParentName] = true;
        } else {
          queryToPropNames(item, names, itemParentName);
        }
      });
    }
  } else {
    names[parentName] = true;
  }
};

export const throwIfNotPropertyNotDefinedError = (err) => {
  if (!(err instanceof PropertyNotDefinedError)) {
    throw err;
  }
};

// We analyze the MongoDB-style query to dynamically extract the properties from the component,
// including properties in deeply nested components. A previous design called get() on the
// components to return the values, but that does not always provide access to deeply nested
// components.
//
// TODO: is there a more efficient way of extracting these values via a callback in the sift() call?
// The selectorFn parameter does not work this way so it would probably require a change to sift.
const queryToProps = (query, component) => {
  const props = {};
  const names = {};

  queryToPropNames(query, names);
  names['parent.value'] = true;

  forEach(names, (value, name) => {
    try {
      set(props, name, component.get(name));
    } catch (err) {
      // Swallow the error if the property is not defined. This allows us to do things like ignore
      // outdated filters, e.g. a filter for a property, which has since been deleted.
      throwIfNotPropertyNotDefinedError(err);
    }
  });

  return props;
};

export default queryToProps;
