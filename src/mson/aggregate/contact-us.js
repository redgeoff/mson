export default {
  name: 'ContactUs',
  component: 'Form',
  props: ['from', 'sender', 'replyTo', 'to', 'subject', 'body', 'storeType'],
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'from',
        component: 'TextField'
      },
      {
        name: 'sender',
        component: 'TextField'
      },
      {
        name: 'replyTo',
        component: 'TextField'
      },
      {
        name: 'to',
        component: 'TextField',
        required: true
      },
      {
        name: 'subject',
        component: 'TextField'
      },
      {
        name: 'body',
        component: 'TextField'
      },
      {
        name: 'storeType',
        component: 'TextField',
        required: true
      }
    ]
  },
  sender: '"{{fields.name.value}}" <{{fields.email.value}}>',
  replyTo: '"{{fields.name.value}}" <{{fields.email.value}}>',
  from: '"{{fields.name.value}}" <{{fields.email.value}}>',
  subject: '{{fields.subject.value}}',
  body: '{{fields.body.value}}',
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
          sender: '"{{sender}}>',
          replyTo: '"{{replyTo}}>',
          from: '"{{from}}>',
          to: '{{to}}',
          subject: '{{subject}}',
          body: '{{body}}',

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
