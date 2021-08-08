import Action from './action';

export default class ResetPassword extends Action {
  className = 'ResetPassword';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'token',
            component: 'TextField',
          },
        ],
      },
    });

    this._setDefaults(props, { layer: 'backEnd' });
  }

  _reset(props) {
    return this._registrar.resetPassword.resetPassword(props);
  }

  async act(props) {
    return this._reset({
      context: props.context,
      component: props.component,
      token: this.get('token'),
    });
  }
}
