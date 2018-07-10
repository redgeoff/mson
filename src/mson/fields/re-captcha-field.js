import Field from './field';

export default class ReCAPTCHAField extends Field {
  _create(props) {
    super._create(props);

    this.set({
      props: ['siteKey'],
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'siteKey',
            component: 'TextField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      name: 'captcha',
      required: true
    });
  }
}
