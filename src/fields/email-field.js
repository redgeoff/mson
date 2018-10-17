export default {
  component: 'TextFieldHiddenSchema',
  maxLength: '50',
  validators: [
    {
      where: {
        $not: {
          value: {
            $regex: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$'
          }
        }
      },
      error: 'invalid email'
    }
  ]
};
