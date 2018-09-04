import Action from './action';
import uberUtils from '../uber-utils';

export default class GetRecords extends Action {
  _className = 'GetRecords';

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

  async act(props) {
    const appId = this._globals.get('appId');

    return uberUtils.tryAndDisplayErrorIfAPIError(async () => {
      // TODO: pagination
      const records = await this._registrar.client.record.getAll({
        appId,
        componentName: this.get('storeName'),
        asArray: true,
        where: this.get('where')
      });

      return records.data.records;
    });
  }
}
