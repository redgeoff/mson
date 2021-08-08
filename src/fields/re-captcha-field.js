import Field from './field';

export default class ReCAPTCHAField extends Field {
  className = 'ReCAPTCHAField';

  create(props) {
    super.create(props);

    this.set({
      name: 'captcha',
      schema: {
        component: 'Form',
        fields: [
          {
            // Name is not required
            name: 'name',
            required: false,
          },
          {
            name: 'label',
            docLevel: null,
          },
        ],
      },
    });

    this._setDefaults(props, {
      required: true,
    });
  }
}
