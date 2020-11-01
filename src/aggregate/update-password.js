export default {
  name: 'UpdatePassword',
  component: 'Form',
  fields: [
    {
      component: 'PasswordField',
      name: 'retypePassword',
      label: 'Retype Password',
      required: true,
    },
  ],
  validators: [
    {
      where: {
        fields: {
          retypePassword: {
            value: {
              $ne: '{{fields.password.value}}',
            },
          },
        },
      },
      error: {
        field: 'retypePassword',
        error: 'must match',
      },
    },
  ],
  listeners: [
    {
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'hidden',
          value: true,
        },
        {
          // There can be a race condition where all of the fields are hidden, with the Set above,
          // after the RecordEditor has shown the Save and Cancel buttons. For now, we just make
          // sure to show these buttons. TODO: devise a FieldIterator action that gets a list of all
          // the fields with given properties, e.g. non-buttons, and then only hide the non-button
          // fields.
          component: 'Set',
          name: 'component',
          value: {
            'fields.save.hidden': false,
            'fields.cancel.hidden': false,
          },
        },
        {
          component: 'Set',
          name: 'out',
          value: false,
        },
        {
          component: 'Set',
          name: 'component',
          value: {
            'fields.password.hidden': false,
            'fields.password.out': true,
            'fields.password.required': true,
            'fields.retypePassword.hidden': false,
          },
        },
      ],
    },
  ],
};
