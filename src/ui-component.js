import Component from './component';

export default class UIComponent extends Component {
  className = 'UIComponent';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'hidden',
            component: 'BooleanField',
            label: 'Hidden',
            docLevel: 'basic',
          },
          {
            name: 'render',
            component: 'Field',
            label: 'Render',
            docLevel: 'basic',
          },
        ],
      },
    });
  }
}
