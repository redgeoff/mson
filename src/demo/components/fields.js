export default {
  name: 'app.Fields',
  component: 'Form',
  fields: [
    {
      component: 'BooleanField',
      name: 'booleanField',
      label: 'BooleanField',
      help: 'Example help'
    },

    {
      name: 'buttonField',
      component: 'ButtonField',
      label: 'Submit',
      icon: 'Save',
      type: 'submit',
      block: true
    },

    {
      component: 'ChainedSelectField',
      name: 'chainedSelectField',
      label: 'ChainedSel',
      help: 'Example help',
      required: true,
      blankString: 'None',
      // multiline: true,
      // fullWidth: true,
      options: [
        { value: 1, parentValue: null, label: 'Germany' },
        { value: 2, parentValue: null, label: 'USA' },

        { value: 3, parentValue: 1, label: 'BMW' },
        { value: 4, parentValue: 1, label: 'Mercedes' },

        { value: 5, parentValue: 2, label: 'Tesla' },

        { value: 6, parentValue: 3, label: 'i3' },
        { value: 7, parentValue: 3, label: 'i8' },
        { value: 8, parentValue: 4, label: 'S-Class' },

        { value: 9, parentValue: 5, label: 'Model S' },

        { value: 10, parentValue: 9, label: 'Red' },
        { value: 11, parentValue: 9, label: 'Blue' }
      ]
    },

    {
      component: 'ChainedSelectListField',
      name: 'chainedSelectListField',
      label: 'ChainSelList',
      help: 'Example help',
      required: true,
      blankString: 'None',
      // multiline: true,
      // fullWidth: true,
      options: [
        { value: 1, parentValue: null, label: 'Germany' },
        { value: 2, parentValue: null, label: 'USA' },

        { value: 3, parentValue: 1, label: 'BMW' },
        { value: 4, parentValue: 1, label: 'Mercedes' },

        { value: 5, parentValue: 2, label: 'Tesla' },

        { value: 6, parentValue: 3, label: 'i3' },
        { value: 7, parentValue: 3, label: 'i8' },
        { value: 8, parentValue: 4, label: 'S-Class' },

        { value: 9, parentValue: 5, label: 'Model S' },

        { value: 10, parentValue: 9, label: 'Red' },
        { value: 11, parentValue: 9, label: 'Blue' }
      ]
    },

    {
      component: 'EmailField',
      name: 'emailField',
      label: 'Email',
      help: 'Example help',
      required: true
    },

    {
      name: 'textField',
      component: 'TextField',
      label: 'TextField',
      help: 'Example help',
      required: true
    }
  ]
};
