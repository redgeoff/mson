import Action from './action';
import uberUtils from '../uber-utils';

export default class GetRecords extends Action {
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

    try {
      // TODO: pagination
      const records = await this._registrar.client.record.getAll({
        appId,
        componentName: this.get('storeName'),
        asArray: true,
        where: this.get('where')
      });

      // TODO: remove?
      // const form = props.component.get('form');
      //
      // records.data.records.edges.forEach(edge => {
      //   const values = { id: edge.node.id };
      //
      //   form.eachField(field => {
      //     // Field exists in returned records?
      //     const val = edge.node.fieldValues[field.get('name')];
      //     if (val) {
      //       values[field.get('name')] = val;
      //     }
      //   });
      //
      //   // TODO: if this is needed then probably create prop like addForm
      //   // props.component.addForm(values);
      // });

      return records.data.records;
    } catch (err) {
      uberUtils.displayError(err.toString());

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
