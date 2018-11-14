import Validator from './validator';
import get from 'lodash/get';

it('should fill props', () => {
  let validator = new Validator({
    foo: 'bar',
    yar: 'nar',
    year: 2018,
    value: {
      firstName: 'Jane',
      lastName: 'Doe'
    }
  });

  expect(validator._fillProps('{{foo}} {{yar}}')).toEqual('bar nar');
  expect(validator._fillProps('{{year}}')).toEqual(2018);
  expect(
    validator._fillProps('{{value.firstName}} {{value.lastName}}')
  ).toEqual('Jane Doe');
  expect(validator._fillProps('{{value.firstName}}')).toEqual('Jane');
});

it('should fill where', () => {
  let validator = new Validator({
    length: 20,
    maxLength: 10,
    value: 'foo'
  });

  let where1 = {
    length: {
      $gt: '{{maxLength}}'
    }
  };

  validator._fillWhere(where1);
  expect(where1).toEqual({
    length: {
      $gt: 10
    }
  });

  let where2 = {
    value: {
      $eq: '{{value}}'
    }
  };

  validator._fillWhere(where2);
  expect(where2).toEqual({
    value: {
      $eq: 'foo'
    }
  });

  let where3 = {
    $or: {
      length: {
        $gt: '{{maxLength}}'
      },
      value: {
        $eq: '{{value}}'
      }
    }
  };

  validator._fillWhere(where3);
  expect(where3).toEqual({
    $or: {
      length: {
        $gt: 10
      },
      value: {
        $eq: 'foo'
      }
    }
  });
});

class ArrayGetter {
  constructor(props) {
    this.props = props;
  }

  get(name) {
    return get(this.props, name);
  }
}

it('should validate with rules', () => {
  const getter = new ArrayGetter({
    length: 20,
    maxLength: 10
  });

  let validator = new Validator(getter);

  let rules = [
    {
      where: {
        length: {
          $gt: '{{maxLength}}'
        }
      },
      error: '{{maxLength}} characters or less'
    },
    {
      where: {
        length: {
          $gt: '{{maxLength}}'
        }
      },
      error: {
        field: 'some-target',
        error: '{{length}} is too many'
      }
    }
  ];

  expect(validator._validateWithRule(rules[0])).toEqual(
    '10 characters or less'
  );

  expect(validator.validate(rules)).toEqual(['10 characters or less']);

  expect(validator.validate(rules, true)).toEqual([
    '10 characters or less',
    {
      field: 'some-target',
      error: '20 is too many'
    }
  ]);

  // Simulate the user changing the length
  validator._props.props.length = 10;
  expect(validator._validateWithRule(rules[0])).toEqual(undefined);
});

it('should validate with escaped regex', () => {
  // console.log(/\d/.test('secret1'))

  const getter = new ArrayGetter({
    password: 'secret'
  });

  let validator = new Validator(getter);

  let rules = [
    {
      where: {
        fields: {
          password: {
            $not: {
              $regex: '\\d'
            }
          }
        }
      },
      error: 'must contain a number'
    }
  ];

  expect(validator.validate(rules)).toEqual(['must contain a number']);

  // Simulate the user changing the password
  validator._props.props.fields = {
    password: 'secret1'
  };
  expect(validator.validate(rules)).toEqual([]);
});
