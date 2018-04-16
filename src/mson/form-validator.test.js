import FormValidator from './form-validator';

it('should validate', () => {
  const validator = new FormValidator();
  validator.setValues({
    selector: {
      // retypePassword: {
      //   value: {
      //     $ne: '{{password.value}}'
      //   }
      // }
    },
    error: {
      field: 'retypePassword',
      error: 'must match'
    }
  });

  validator.validate();
  console.log(validator.getErrs());
  console.log(JSON.stringify(validator.getErrs()));
});
