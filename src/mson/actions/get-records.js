import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class GetRecords extends Action {
  _create(props) {
    super._create(props);

    this.set({
      props: ['type', 'where']
    });
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      // TODO: pagination
      const records = await registrar.client.record.getAll({
        appId,
        componentName: this.get('type'),
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
      utils.displayError(err.toString());

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
