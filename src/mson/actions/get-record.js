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

    return uberUtils.tryAndDisplayErrorIfAPIError(async () => {
      const record = await this._recordGet({
        appId,
        componentName: this.get('storeName'),
        where: this.get('where')
      });

      return record.data.record;
    });
  }
}
