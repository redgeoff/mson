import Container from './container';

export default class Alert extends Container {
  className = 'Alert';

  create(props) {
    super.create(props);

    this.set({
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
    });
  }
}
