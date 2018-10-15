import Action from './action';

export default class RequestPasswordReset extends Action {
  _className = 'RequestPasswordReset';

  _create(props) {
    super._create(props);
    this._setDefaults(props, { layer: 'backEnd' });
  }

  _requestReset(props) {
    return this._registrar.resetPassword.requestReset(props);
  }

  async act(props) {
    return this._requestReset({
      context: props.context,
      component: props.component
    });
  }
}
