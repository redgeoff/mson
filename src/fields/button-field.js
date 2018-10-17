import Field from './field';

export default class ButtonField extends Field {
  _className = 'ButtonField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'type',
            component: 'SelectField',
            label: 'Type',
            options: [{ value: 'submit', label: 'Submit' }],
            docLevel: 'basic'
          },
          {
            // TODO: create IconListField (with preview) and use it here
            name: 'icon',
            component: 'TextField',
            label: 'Icon',
            docLevel: 'basic'
          },
          {
            name: 'variant',
            component: 'TextField',
            // Hidden as it may not be portable to have a variant type and this may be better to
            // configure at the theme layer
            hidden: true
          }
        ]
      }
    });

    this._setDefaults(props, { block: false, out: false });
  }

  emitClick() {
    this.emitChange('click');

    if (this.get('type') === 'submit') {
      // Disable to prevent the user from clicking the button again before the action has completed
      this.set({ disabled: true });
    }
  }
}
