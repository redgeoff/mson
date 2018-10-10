export default {
  name: 'AuthenticatedContactUs',
  component: 'ContactUs',
  listeners: [
    {
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'component',
          value: {
            'fields.captcha.hidden': true,
            'fields.captcha.required': false,

            // The email is prepopulated with that of the logged in user so we can hide this
            'fields.email.hidden': true
          }
        }
        // TODO: create a construct for loading the user's name into the session and use it here to
        // prepopulate the name fields. Or better yet, just expect the user to configure a GetDoc
        // action to load the data.
      ]
    },
    {
      event: 'load',
      actions: [
        {
          component: 'Set',
          name: 'fields.email.value',
          value: '{{globals.session.user.username}}'
        },
        {
          // Set the form to pristine so that we don't get warned about discarding changes
          component: 'Set',
          name: 'pristine',
          value: true
        }
      ]
    }
  ]
};
