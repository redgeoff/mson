import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class GetRecords extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    const appId = globals.get('appId');

    // TODO: pagination
    const records = await registrar.client.record.getAll({
      appId,
      componentName: this.get('type'),
      asArray: true
    });

    const form = props.component.get('form');

    records.data.records.edges.forEach(edge => {
      const values = { id: edge.node.id };

      form.eachField(field => {
        // Field exists in returned records?
        const val = edge.node.fieldValues[field.get('name')];
        if (val) {
          values[field.get('name')] = val;
        }
      });

      // TODO: if this is needed then probably create prop like addForm
      // props.component.addForm(values);
    });

    return records.data.records;
  }
}
