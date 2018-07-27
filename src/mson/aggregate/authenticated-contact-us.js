export default {
  name: 'AuthenticatedContactUs',
  component: 'ContactUs',
  listeners: [
    {
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'fields.captcha.hidden',
          value: true
        },
        {
          component: 'Set',
          name: 'fields.captcha.required',
          value: false
        },
        {
          // The email is prepopulated with that of the logged in user so we can hide this
          component: 'Set',
          name: 'fields.email.hidden',
          value: true
        }
        // TODO: create a construct for loading the user's name into the session and use it here to
        // prepopulate the name fields. Or better yet, just expect the user to configure a GetRecord
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
