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
      retypePassword: {
        value: {
          $ne: '{{password.value}}'
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
      retypePassword: {
        value: {
          $invalidOp: '{{password.value}}'
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
