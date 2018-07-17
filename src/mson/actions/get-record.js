import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class GetRecord extends Action {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField',
            required: true
          },
          {
            name: 'where',
            component: 'WhereField'
          }
        ]
      }
    });
  }

  _recordGet(props) {
    return registrar.client.record.get(props);
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      const record = await this._recordGet({
        appId,
        componentName: this.get('storeName'),
        where: this.get('where')
      });

      return record.data.record;
    } catch (err) {
      utils.displayError(err.toString());

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
