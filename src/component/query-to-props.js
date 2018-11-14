import forEach from 'lodash/forEach';
import set from 'lodash/set';

export const queryToPropNames = (query, names, parentName) => {
  if (query !== null && typeof query === 'object') {
    if (Array.isArray(query)) {
      query.forEach(item => queryToPropNames(item, names, parentName));
    } else {
      forEach(query, (item, name) => {
        // Not operator? TODO: actually check operators so that we support variables that begin with
        // $
        if (name.charAt(0) !== '$') {
          parentName =
            parentName === undefined ? name : parentName + '.' + name;
        }
        queryToPropNames(item, names, parentName);
      });
    }
  } else {
    names[parentName] = true;
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

  forEach(names, (value, name) => {
    set(props, name, component.get(name));
  });

  return props;
};

export default queryToProps;
