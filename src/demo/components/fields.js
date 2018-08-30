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
      label: 'ButtonField',
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
      component: 'FormsField',
      name: 'formsField',
      label: 'Records',
      help: 'Example help',
      required: true,
      form: {
        component: 'Form',
        fields: [
          {
            name: 'firstName',
            component: 'TextField',
            label: 'First Name',
            required: true
          },
          {
            name: 'lastName',
            component: 'TextField',
            label: 'Last Name'
          }
        ]
      }
    },

    {
      name: 'idField',
      component: 'IdField',
      label: 'IdField',
      help: 'Example help',
      required: true
    },

    {
      name: 'integerField',
      component: 'IntegerField',
      label: 'IntegerField',
      help: 'Example help',
      required: true
    },

    // TODO: need to implement default mechanism in ListField that creates new field by default and
    // then allows user to click to add new field.
    // {
    //   component: 'ListField',
    //   name: 'listField',
    //   label: 'ListField',
    //   help: 'Example help',
    //   required: true,
    //   field: {
    //     component: 'TextField'
    //   }
    // },

    {
      name: 'numberField',
      component: 'NumberField',
      label: 'NumberField',
      help: 'Example help',
      required: true
    },

    {
      name: 'passwordField',
      component: 'PasswordField',
      label: 'PasswordField',
      help: 'Example help',
      required: true
    },

    {
      name: 'personFullNameField',
      component: 'PersonFullNameField',
      label: 'PersonFullNameField',
      help: 'Example help',
      required: true
    },

    {
      name: 'personNameField',
      component: 'PersonNameField',
      label: 'PersonNameField',
      help: 'Example help',
      required: true
    },

    {
      component: 'ReCAPTCHAField'
    },

    {
      name: 'selectField',
      component: 'SelectField',
      label: 'SelectField',
      help: 'Example help',
      required: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' }
      ]
    },

    {
      name: 'selectFieldMult',
      component: 'SelectField',
      label: 'SelFld (mult)',
      help: 'Example help',
      required: true,
      multiple: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' }
      ]
    },

    {
      name: 'selectListField',
      component: 'SelectListField',
      label: 'SelListField',
      help: 'Example help',
      required: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' }
      ]
    },

    {
      name: 'textField',
      component: 'TextField',
      label: 'TextField',
      help: 'Example help',
      required: true
    }

    // TODO: need to implement default mechanism in ListField that creates new field by default and
    // then allows user to click to add new field.
    // {
    //   component: 'TextListField',
    //   name: 'textListField',
    //   label: 'TextListField',
    //   help: 'Example help',
    //   required: true
    // }
  ]
};
