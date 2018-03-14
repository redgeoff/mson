// TODO: keep the store implementation or better to have listeners?

import Component from './component';
import DocStore from './doc-store';

export default class RecordEditor extends Component {
  constructor(props) {
    super(props);
    this._createStore();
  }

  _createStore() {
    this._docs = new DocStore();

    this._docs.on('change', change => {
      // TODO: need to make real-time updates optional or at least warn user if they will lose
      // changes with the updates

      const id = this.get('id');
      if (
        (change.event === 'create' || change.event === 'update') &&
        change.doc.id === id
      ) {
        this.get('form').setValues(change.doc);
      }
    });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'form', 'id');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'form', 'id');
    return value === undefined ? super.getOne(name) : value;
  }

  getStore() {
    return this._docs;
  }

  async saveValues() {
    await this._docs.set(this.get('form').getValues());
  }

  save() {
    this._emitChange('save');
  }

  cancel() {
    this._emitChange('cancel');
  }
}
