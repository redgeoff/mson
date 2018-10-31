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
            name: 'fieldFactory',
            required: false
          },
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
      ...this.get([
        'block',
        'fullWidth',
        'minLength',
        'maxLength',
        'minWords',
        'maxWords',
        'invalidRegExp',
        'multiline'
      ])
    });
  }

  set(props) {
    super.set(props);
    this._setForAllFields(props, [
      'minLength',
      'maxLength',
      'minWords',
      'maxWords',
      'invalidRegExp',
      'multiline'
    ]);
  }
}
