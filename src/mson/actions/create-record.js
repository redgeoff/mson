import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class CreateRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      await registrar.client.record.create({
        appId,
        componentName: this.get('type'),
        fieldValues: props.component.get('value')
      });

      // TODO: What to do with the created data?
    } catch (err) {
      // TODO: this logic needs to be extracted so that it can be reused for different calls
      const message = JSON.parse(err.graphQLErrors[0].message);
      message.error.forEach(err => {
        props.component.getField(err.field).setErr(err.error);
      });

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
