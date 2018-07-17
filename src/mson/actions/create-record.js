import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class CreateRecord extends Action {
  _create(props) {
    super._create(props);

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
    const appId = globals.get('appId');

    try {
      await registrar.client.record.create({
        appId,
        componentName: this.get('storeName'),
        fieldValues: props.component.get('value')
      });

      // TODO: What to do with the created data?
    } catch (err) {
      utils.setFormErrorsFromAPIError(err, props.component);

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
