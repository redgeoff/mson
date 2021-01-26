const emailField = {
  component: 'TextFieldHiddenSchema',
  maxLength: '50',
  validators: [
    {
      where: {
        value: {
          $not: {
            $regex: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$',
          },
        },
      },
      error: 'invalid email',
    },
  ],
};

export default emailField;
