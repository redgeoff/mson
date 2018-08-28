import Action from './action';
import uberUtils from '../uber-utils';

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
    return this._registrar.client.record.get(props);
  }

  async act(props) {
    const appId = this._globals.get('appId');

    try {
      const record = await this._recordGet({
        appId,
        componentName: this.get('storeName'),
        where: this.get('where')
      });

      return record.data.record;
    } catch (err) {
      uberUtils.displayError(err.toString());

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
