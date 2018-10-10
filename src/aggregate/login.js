export default {
  name: 'Login',
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
      name: 'signUp',
      label: 'Sign Up',
      icon: 'CheckCircle'
    },
    {
      component: 'ButtonField',
      name: 'forgotPassword',
      label: 'Password?',
      icon: 'VpnKey'
    },
    {
      component: 'ButtonField',
      name: 'contact',
      label: 'Contact',
      icon: 'LiveHelp'
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
