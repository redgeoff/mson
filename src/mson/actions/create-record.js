import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import uberUtils from '../uber-utils';

export default class CreateRecord extends Action {
  _create(props) {
    super._create(props);

    // For mocking
    this._registrar = registrar;
    this._globals = globals;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField'
          }
        ]
      }
    });
  }

  async act(props) {
    const appId = this._globals.get('appId');

    return uberUtils.tryAndSetFormErrorsIfAPIError(async () => {
      await this._registrar.client.record.create({
        appId,
        componentName: this.get('storeName'),
        fieldValues: props.component.get('value')
      });

      // TODO: What to do with the created data?
    }, props.component);
  }
}
