export default {
  name: 'ResetPassword',
  component: 'Form',
  fields: [
    {
      component: 'EmailField',
      name: 'email',
      label: 'Email',
      required: true
    }
  ]
};
