import queryToProps, {
  queryToPropNames,
  throwIfNotPropertyNotDefinedError
} from './query-to-props';
import get from 'lodash/get';
import PropertyNotDefinedError from './property-not-defined-error';

class MockComponent {
  constructor(props) {
    this._props = props;
  }

  get(name) {
    return get(this._props, name);
  }
}

it('should get prop names from query', () => {
  let names = {};

  // Basic
  queryToPropNames({ name: 'bar' }, names);
  expect(names).toEqual({ name: true });

  // With null value
  names = {};
  queryToPropNames({ name: null }, names);
  expect(names).toEqual({ name: true });

  // Nested within operator
  names = {};
  queryToPropNames(
    {
      $and: [
        {
          name: 'foo'
        },
        {
          label: 'Foo'
        }
      ]
    },
    names
  );
  expect(names).toEqual({ name: true, label: true });

  // Sub operator
  names = {};
  queryToPropNames(
    {
      $and: [
        {
          name: 'foo'
        },
        {
          location: { $in: ['Costa Rica', 'Brazil'] }
        }
      ]
    },
    names
  );
  expect(names).toEqual({ name: true, location: true });

  // Nested & dot notation
  names = {};
  queryToPropNames(
    {
      'foo.nar': {
        jar: {
          kar: 'dar'
        }
      }
    },
    names
  );
  expect(names).toEqual({ 'foo.nar.jar.kar': true });
});

it('should convert simple query', () => {
  const component = new MockComponent({ name: 'bar' });
  const props = queryToProps({ name: 'foo' }, component);
  expect(props).toEqual({ name: 'bar' });
});

it('should merge props when converting query', () => {
  const values = {
    name: 'bar',
    child: {
      name: 'baz'
    }
  };
  const component = new MockComponent(values);

  const props = queryToProps(
    {
      $and: [
        {
          name: 'foo'
        },
        {
          'child.name': 'foo'
        }
      ]
    },
    component
  );

  expect(props).toEqual(values);
});

it('should handle errors', () => {
  // Should not throw
  throwIfNotPropertyNotDefinedError(new PropertyNotDefinedError());

  // Should throw error as not PropertyNotDefinedError
  const err = new Error();
  expect(() => throwIfNotPropertyNotDefinedError(err)).toThrow(err);
});
