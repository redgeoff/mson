const alert = {
  component: 'Container',
  name: 'Alert',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'severity',
        component: 'SelectField',
        required: true,
        options: [
          { value: 'error', label: 'Error' },
          { value: 'warning', label: 'Warning' },
          { value: 'info', label: 'Info' },
          { value: 'success', label: 'Success' },
        ],
      },
    ],
  },
};

export default alert;
