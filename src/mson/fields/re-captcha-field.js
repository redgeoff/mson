import Field from './field';

export default class ReCAPTCHAField extends Field {
  _create(props) {
    super._create(props);

    this.set({
      name: 'captcha',
      schema: {
        component: 'Form',
        fields: [
          {
            // Name is not required
            name: 'name',
            component: 'TextField',
            required: false
          }
        ]
      }
    });

    this._setDefaults(props, {
      required: true
    });
  }
}
