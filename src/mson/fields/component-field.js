import Field from './field';

export default class ComponentField extends Field {
  _className = 'ComponentField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'content',
            component: 'Field'
          }
        ]
      }
    });

    this._setDefaults(props, { in: false, out: false });
  }
}
