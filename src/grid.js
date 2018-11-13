import Component from './component';

export default class Grid extends Component {
  _className = 'Grid';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'items',
            component: 'Field'
          }
        ]
      }
    });
  }
}
