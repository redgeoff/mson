import Component from './component';

export default class Card extends Component {
  _create(props) {
    super._create(props);
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'content',
            component: 'Field',
            label: 'Content',
            required: true
          }
        ]
      }
    });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'content');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'content');
    return value === undefined ? super.getOne(name) : value;
  }
}
