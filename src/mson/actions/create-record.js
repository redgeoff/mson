import Action from './action';
import client from '../client';

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

    const create = await client.record.create({
      appId: appId,
      componentName: this.get('type'),
      fieldValues: props.component.get('value')
    });

    // TODO: how to properly handle errors, report them to the user and then stop the listener chain?
    console.log('create', create);
  }
}
