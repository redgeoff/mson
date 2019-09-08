import Component from './component';

export default class UIComponent extends Component {
  _className = 'UIComponent';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'hidden',
            component: 'BooleanField',
            label: 'Hidden',
            docLevel: 'basic'
          }
        ]
      }
    });
  }
}
