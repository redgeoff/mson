import Field from './field';

export default class ReCAPTCHAField extends Field {
  _create(props) {
    super._create(props);

    this._setDefaults(props, {
      name: 'captcha',
      required: true
    });
  }
}
