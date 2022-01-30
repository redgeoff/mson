import Field from './field';
import utils from '../utils/utils';

export default class ComponentField extends Field {
  className = 'ComponentField';

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

    // All fields must have a name
    const name = props.name === undefined ? utils.uuid() : props.name;

    this._setDefaults(props, { in: false, out: false, name });
  }
}
