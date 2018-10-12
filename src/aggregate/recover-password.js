export default {
  name: 'RecoverPassword',
  component: 'Form',
  fields: [
    {
      component: 'EmailField',
      name: 'email',
      label: 'Email',
      required: true
    },
    {
      component: 'ReCAPTCHAField'
    }
  ]

  // // TODO:
  // listeners: [
  //   event: 'createRecord',
  //   actions: [
  //     {
  //       component: 'Email',
  //       subject: 'Reset Password',
  //
  //       // TODO: support markdown
  //       body: '<a href="{{arguments.url}}">Reset your password</a>'
  //     }
  //   ]
  // ]
};
