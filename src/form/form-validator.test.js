import FormValidator from './form-validator';

it('should validate', () => {
  const validator = new FormValidator();

  validator.setValues({});

  validator.validate();
  expect(validator.hasErr()).toEqual(true);
  expect(validator.getErrs()).toEqual([
    {
      field: 'where',
      error: 'required'
    },
    {
      field: 'error',
      error: 'required'
    }
  ]);

  validator.setValues({
    where: {
      fields: {
        retypePassword: {
          value: {
            $ne: '{{fields.password.value}}'
          }
        }
      }
    },
    error: {
      field: 'retypePassword',
      error: 'must match'
    }
  });

  validator.validate();
  expect(validator.hasErr()).toEqual(false);

  validator.setValues({
    where: {
      fields: {
        retypePassword: {
          value: {
            $invalidOp: '{{fields.password.value}}'
          }
        }
      }
    },
    error: {
      field: 'retypePassword',
      error: 'must match'
    }
  });

  validator.validate();
  expect(validator.hasErr()).toEqual(true);
  expect(validator.getErrs()).toEqual([
    {
      field: 'where',
      error: [
        {
          error: 'Unknown operation $invalidOp'
        }
      ]
    }
  ]);
});
