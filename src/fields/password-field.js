export default {
  component: 'TextFieldHiddenSchema',
  type: 'password',
  minLength: 8,
  maxLength: 30,
  validators: [
    {
      where: {
        value: {
          $not: {
            $regex: '\\d'
          }
        }
      },
      error: 'must contain a number'
    },
    {
      where: {
        value: {
          $not: {
            $regex: '[a-zA-Z]'
          }
        }
      },
      error: 'must contain a letter'
    },
    {
      where: {
        value: {
          $regex: '[^a-zA-Z0-9\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+]'
        }
      },
      error: 'contains an invalid character'
    }
  ]
};
