export default {
  component: 'Form',
  fields: [
    {
      name: 'addressLine1',
      component: 'TextField',
      label: 'Address Line 1',
      maxLength: 100,
      required: true,
      hidden: true
    },
    {
      name: 'addressLine2',
      component: 'TextField',
      label: 'Address Line 2',
      maxLength: 100,
      required: false,
      hidden: true
    },
    {
      name: 'city',
      component: 'CityField',
      label: 'City',
      required: true,
      block: false,
      hidden: true
    },
    {
      name: 'stateProvince',
      component: 'ProvinceField',
      label: 'State/Province',
      required: true,
      block: false,
      hidden: true
    },
    {
      name: 'postalCode',
      component: 'PostalCodeField',
      label: 'Postal Code',
      required: true,
      hidden: true
    },
    {
      name: 'country',
      component: 'CountryField',
      label: 'Country',
      required: true
    }
  ],
  listeners: [
    {
      event: 'fields.country.value',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.country.value': {
              $ne: null
            }
          },
          actions: [
            {
              component: 'Emit',
              event: 'adjustFields'
            },
            {
              component: 'Emit',
              event: 'setHidden',
              value: false
            }
          ],
          else: [
            {
              component: 'Emit',
              event: 'setHidden',
              value: true
            },
            {
              // Reset the form to clear errors, etc...
              component: 'Set',
              name: 'reset',
              value: true
            }
          ]
        }
      ]
    },
    {
      event: 'setHidden',
      actions: [
        {
          component: 'Set',
          name: 'component',
          value: {
            'fields.addressLine1.hidden': '{{arguments}}',
            'fields.addressLine2.hidden': '{{arguments}}',
            'fields.city.hidden': '{{arguments}}',
            'fields.stateProvince.hidden': '{{arguments}}',
            'fields.postalCode.hidden': '{{arguments}}'
          }
        }
      ]
    },
    {
      event: 'adjustFields',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.country.value': 'US'
          },
          actions: [
            {
              component: 'Set',
              name: 'component',
              value: {
                fields: [
                  {
                    name: 'stateProvince',
                    component: 'StateField',
                    label: 'State',
                    required: true,
                    block: false
                  }
                ],
                'fields.postalCode.label': 'Zip Code'
              }
            }
          ],
          else: [
            {
              component: 'Set',
              name: 'component',
              value: {
                fields: [
                  {
                    name: 'stateProvince',
                    component: 'ProvinceField',
                    label: 'State/Province',
                    required: true,
                    block: false
                  }
                ],
                'fields.postalCode.label': 'Postal Code'
              }
            }
          ]
        }
      ]
    }
  ]
};
