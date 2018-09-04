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
            component: 'TextField'
          },
          {
            name: 'icon',
            component: 'TextField'
          },
          {
            name: 'variant',
            component: 'TextField'
          }
        ]
      }
    });

    this._setDefaults(props, { block: false, out: false });
  }

  emitClick() {
    this._emitChange('click');

    if (this.get('type') === 'submit') {
      // Disable to prevent the user from clicking the button again before the action has completed
      this.set({ disabled: true });
    }
  }
}
