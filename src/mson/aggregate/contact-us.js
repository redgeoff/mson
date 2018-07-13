export default {
  name: 'ContactUs',
  component: 'Form',
  props: ['to', 'storeType'],
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'to',
        component: 'TextField',
        required: true
      },
      {
        name: 'storeType',
        component: 'TextField',
        required: true
      }
    ]
  },
  fields: [
    {
      component: 'PersonNameField',
      name: 'name',
      label: 'Name',
      required: true,
      block: false
    },
    {
      component: 'EmailField',
      name: 'email',
      label: 'Email',
      required: true
    },
    {
      component: 'TextField',
      name: 'subject',
      label: 'Subject',
      required: true,
      fullWidth: true
    },
    {
      component: 'TextField',
      name: 'body',
      label: 'Body',
      required: true,
      multiline: true,
      rows: 2,
      rowsMax: 20,
      fullWidth: true
    },
    {
      component: 'ReCAPTCHAField'
    },
    {
      component: 'ButtonField',
      type: 'submit',
      name: 'submit',
      label: 'Send Message',
      icon: 'Email'
    },
    {
      component: 'ButtonField',
      name: 'cancel',
      label: 'Cancel',
      icon: 'Cancel'
    }
  ],
  listeners: [
    {
      event: 'submit',
      actions: [
        {
          component: 'UpsertRecord',
          type: '{{storeType}}'
        },
        {
          component: 'Snackbar',
          message: 'Message sent. Please expect a response shortly.'
        },
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    },
    {
      event: 'createRecord',
      actions: [
        {
          component: 'Email',
          sender: '"{{fields.name.value}}" <{{fields.email.value}}>',
          replyTo: '"{{fields.name.value}}" <{{fields.email.value}}>',
          from: '"{{fields.name.value}}" <{{fields.email.value}}>',
          to: '{{to}}',
          subject: '{{fields.subject.value}}',
          body: '{{fields.body.value}}',

          // Detach so that user doesn't have to wait for email to send
          detach: true
        }
      ]
    },
    {
      event: 'cancel',
      actions: [
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    }
  ]
};
