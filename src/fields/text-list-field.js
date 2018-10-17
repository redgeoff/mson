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
            name: 'minLength',
            component: 'IntegerField',
            label: 'Min Length',
            docLevel: 'basic'
          },
          {
            name: 'maxLength',
            component: 'IntegerField',
            label: 'Max Length',
            docLevel: 'basic'
          },
          {
            name: 'minWords',
            component: 'IntegerField',
            label: 'Min Words',
            docLevel: 'basic'
          },
          {
            name: 'maxWords',
            component: 'IntegerField',
            label: 'Max Words',
            docLevel: 'basic'
          },
          {
            name: 'invalidRegExp',
            component: 'TextField',
            label: 'Invalid RegExp',
            docLevel: 'basic'
          },
          {
            name: 'multiline',
            component: 'BooleanField',
            label: 'Multiline',
            docLevel: 'basic'
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
