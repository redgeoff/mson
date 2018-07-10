export default {
  component: 'Form',
  fields: [
    {
      component: 'EmailField',
      name: 'username',
      label: 'Email',
      required: true,
      fullWidth: true
    },
    {
      component: 'PasswordField',
      name: 'password',
      label: 'Password',
      required: true,
      fullWidth: true
    },
    {
      component: 'ButtonField',
      name: 'submit',
      label: 'Log In',
      type: 'submit',
      icon: 'PlayArrow'
    },
    {
      component: 'ButtonField',
      name: 'createAccount',
      label: 'Create account'
    },
    {
      component: 'ButtonField',
      name: 'forgotPassword',
      label: 'Forgot password?'
    }
  ],
  listeners: [
    {
      event: 'submit',
      actions: [
        {
          component: 'LogInToAppAndRedirect'
        }
      ]
    }
  ]
};
