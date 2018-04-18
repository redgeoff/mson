import FormValidator from './form-validator';

it('should validate', () => {
  const validator = new FormValidator();

  validator.setValues({});

  validator.validate();
  expect(validator.hasErr()).toEqual(true);
  expect(validator.getErrs()).toEqual([
    {
      field: 'selector',
      error: 'required'
    },
    {
      field: 'error',
      error: 'required'
    }
  ]);

  validator.setValues({
    selector: {
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
    selector: {
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
      field: 'selector',
      error: [
        {
          error: 'Unknown operation $invalidOp'
        }
      ]
    }
  ]);
});
