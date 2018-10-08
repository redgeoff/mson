export default {
  component: 'Form',
  fields: [
    {
      name: 'addressLine1',
      component: 'TextField',
      label: 'Address Line 1',
      maxLength: 100,
      required: true
    },
    {
      name: 'addressLine2',
      component: 'TextField',
      label: 'Address Line 2',
      maxLength: 100,
      required: false
    },
    {
      name: 'city',
      component: 'CityField',
      label: 'City',
      required: true,
      block: false
    },
    {
      name: 'stateProvince',
      component: 'StateField',
      label: 'State',
      required: true,
      block: false
    },
    {
      name: 'postalCode',
      component: 'PostalCodeField',
      label: 'Postal Code',
      required: true
    },
    {
      name: 'country',
      component: 'CountryField',
      label: 'Country',
      required: true
    }
  ]
};
