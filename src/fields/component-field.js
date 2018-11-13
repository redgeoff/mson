import Field from './field';
import utils from '../utils';

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
            component: 'Field',
            required: true
          }
        ]
      }
    });

    // All fields must have a name
    const name = props.name === undefined ? utils.uuid() : props.name;

    this._setDefaults(props, { in: false, out: false, name });
  }
}
