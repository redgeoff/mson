import UIComponent from './ui-component';

export default class Container extends UIComponent {
  className = 'Container';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'content',
            component: 'Field',
            required: true,
          },
        ],
      },
    });
  }
}
