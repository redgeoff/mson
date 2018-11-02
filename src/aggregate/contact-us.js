export default {
  name: 'ContactUs',
  component: 'Form',
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
        name: 'store',
        component: 'Field'
      }
    ]
  },
  sender:
    '"{{fields.firstName.value}} {{fields.lastName.value}}" <{{fields.email.value}}>',
  replyTo:
    '"{{fields.firstName.value}} {{fields.lastName.value}}" <{{fields.email.value}}>',
  from:
    '"{{fields.firstName.value}} {{fields.lastName.value}}" <{{fields.email.value}}>',
  subject: '{{fields.subject.value}}',
  body: '{{fields.body.value}}',
  fields: [
    {
      component: 'PersonNameField',
      name: 'firstName',
      label: 'First Name',
      required: true,
      block: false
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true
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
          component: 'UpsertDoc',
          store: '{{store}}'
        },
        {
          component: 'Snackbar',
          message: 'Message sent. Please expect a response shortly.'
        },
        {
          // Set the form to pristine so that we don't get warned about discarding changes
          component: 'Set',
          name: 'pristine',
          value: true
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
          sender: '{{sender}}',
          replyTo: '{{replyTo}}',
          from: '{{from}}',
          to: '{{to}}',
          subject: '{{subject}}',
          body: '{{body}}',

          // Detached so that user doesn't have to wait for email to send
          detached: true
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
