import ListField from './list-field';
import TextField from './text-field';

export default class TextListField extends ListField {
  _className = 'TextListField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'invalidRegExp',
            component: 'TextField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      startWithField: true
    });
  }

  _newField(index) {
    return new TextField({
      name: index,
      required: false,
      block: this.get('block'),
      fullWidth: this.get('fullWidth'),
      invalidRegExp: this.get('invalidRegExp')
    });
  }

  set(props) {
    super.set(props);

    if (props.invalidRegExp !== undefined) {
      this._setForAllFields({ invalidRegExp: props.invalidRegExp });
    }
  }
}
