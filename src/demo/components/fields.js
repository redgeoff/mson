const chainedSelectOptions = [
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
];

export default {
  name: 'app.Fields',
  component: 'Form',
  fields: [
    {
      component: 'AddressField',
      name: 'addressField',
      label: 'AddressField',
      help: 'Example help',
      required: true,
      elevate: false
    },

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
      options: chainedSelectOptions
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
      options: chainedSelectOptions
    },

    {
      name: 'cityField',
      component: 'CityField',
      label: 'CityField',
      help: 'Example help',
      required: true
    },

    {
      component: 'CollectionField',
      name: 'collectionField',
      label: 'Records',
      help: 'Example help',
      required: true,
      // maxColumns: 1,
      formFactory: {
        component: 'Factory',
        product: {
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
      }
    },

    {
      name: 'countryField',
      component: 'CountryField',
      label: 'CountryField',
      help: 'Example help',
      blankString: 'None',
      required: true
    },

    {
      name: 'dateField',
      component: 'DateField',
      label: 'DateField',
      help: 'Example help',
      // includeTime: true,
      minDate: '2018-01-01T23:07:28.157Z',
      maxDate: '2022-01-01T23:07:28.157Z',
      required: true
    },

    {
      component: 'EmailField',
      name: 'emailField',
      label: 'Email',
      help: 'Example help',
      required: true
    },

    {
      component: 'FormField',
      name: 'formField',
      label: 'FormField',
      help: 'Example help',
      required: true,
      // elevate: true,
      form: {
        component: 'Form',
        fields: [
          {
            name: 'github',
            component: 'URLField',
            block: false,
            label: 'GitHub'
          },
          {
            name: 'medium',
            component: 'URLField',
            label: 'Medium'
          },
          {
            name: 'twitter',
            component: 'URLField',
            label: 'Twitter'
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

    {
      component: 'ListField',
      name: 'listFieldEmail',
      label: 'ListField Email',
      singularLabel: 'Email',
      help: 'Example help',
      required: true,
      fieldFactory: {
        component: 'Factory',
        product: {
          component: 'EmailField'
        }
      }
    },

    {
      component: 'ListField',
      name: 'listFieldName',
      label: 'ListField Name',
      singularLabel: 'Name',
      help: 'Example help',
      required: true,
      fieldFactory: {
        component: 'Factory',
        product: {
          component: 'PersonFullNameField'
        }
      }
    },

    {
      name: 'moneyField',
      component: 'MoneyField',
      label: 'MoneyField',
      help: 'Example help',
      // prefix: '€',
      // decimalSymbol: ',',
      // thousandsSeparatorSymbol: '.',
      required: true
    },

    {
      name: 'numberField',
      component: 'NumberField',
      label: 'NumberField',
      help: 'Example help',
      // includeThousandsSeparator: true,
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
      name: 'phoneField',
      component: 'PhoneField',
      label: 'PhoneField',
      help: 'Example help',
      // defaultMask: '.... ......',
      required: true
    },

    {
      name: 'postalCodeField',
      component: 'PostalCodeField',
      label: 'PostalCodeField',
      help: 'Example help',
      required: true
    },

    {
      name: 'provinceField',
      component: 'ProvinceField',
      label: 'ProvinceField',
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
      blankString: 'None',
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
      blankString: 'None',
      // autocomplete: false,
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
      blankString: 'None', // Provide a way for the user to delete the entry
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' }
      ]
    },

    {
      name: 'stateField',
      component: 'StateField',
      label: 'StateField',
      help: 'Example help',
      blankString: 'None',
      required: true
    },

    {
      name: 'text',
      component: 'Text',
      text:
        '# Text\nCan contain any [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)'
    },

    {
      name: 'timeField',
      component: 'TimeField',
      label: 'TimeField',
      help: 'Example help',
      // showSeconds: true,
      required: true
    },

    {
      name: 'textField',
      component: 'TextField',
      label: 'TextField',
      help: 'Example help',
      // mask: ['(', '/[1-9]/', '/\\d/', '/\\d/', ')'],
      // mask: '(...)',
      required: true
    },

    {
      name: 'textListField',
      component: 'TextListField',
      label: 'TextListField',
      help: 'Example help',
      singularLabel: 'Text Item',
      required: true
    },

    {
      name: 'urlField',
      component: 'URLField',
      label: 'URLField',
      help: 'Example help',
      // newWindow: true,
      required: true
    }
  ]
};
