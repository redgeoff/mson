import Action from './action';
import registrar from '../compiler/registrar';

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
    // TODO: actually query the GraphQL API
    console.log(
      'saving',
      props,
      props.component.get('value'),
      'type=',
      this.get('type')
    );

    // TODO: how to set this? Need some config component for only storing values on server, right? FUTURE: these values should be encrypted so that they can contain API keys
    const appId = 101;

    try {
      const create = await registrar.client.record.create({
        appId: appId,
        componentName: this.get('type'),
        fieldValues: props.component.get('value')
      });

      // TODO: remove. What to do with data?
      console.log('create', create);
    } catch (err) {
      // TODO: this logic needs to be extracted so that it can be reused for different calls
      const message = JSON.parse(err.graphQLErrors[0].message);
      console.log('message=', message);
      message.error.forEach(err => {
        props.component.getField(err.field).setErr(err.error);
      });

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
