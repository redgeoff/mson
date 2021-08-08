import UIComponent from './ui-component';

export default class Fragment extends UIComponent {
  className = 'Fragment';

  _create(props) {
    super._create(props);

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
