import UIComponent from './ui-component';

export default class Grid extends UIComponent {
  className = 'Grid';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'items',
            component: 'Field',
          },
        ],
      },
    });
  }

  set(props) {
    if (props.items !== undefined) {
      props.items.forEach((item) => item.set({ parent: this }));
    }

    super.set(props);
  }
}
