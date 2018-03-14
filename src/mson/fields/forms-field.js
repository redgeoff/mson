import Field from './field';
import DocStore from '../doc-store';
import _ from 'lodash';
import globals from '../globals';

export default class FormsField extends Field {
  // TODO: how does this get cleaned up?
  _bubbleUpChanges() {
    this._docs.on('change', change => {
      this._emitChange('change', change);
    });
  }

  constructor(props) {
    super(props);
    this._docs = new DocStore();
    this._bubbleUpChanges();
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(
      props,
      'form',
      'forbidCreate',
      'forbidUpdate',
      'forbidDelete',
      'minSize',
      'maxSize',
      'singularLabel'
    );
  }

  getOne(name) {
    const value = this._getIfAllowed(
      name,
      'form',
      'forbidCreate',
      'forbidUpdate',
      'forbidDelete',
      'minSize',
      'maxSize',
      'singularLabel'
    );
    return value === undefined ? super.getOne(name) : value;
  }

  getStore() {
    return this._docs;
  }

  *getForms() {
    for (const doc of this._docs.all()) {
      // We need to clone the form so that each item has its own memory space
      const clonedForm = this.get('form').clone();

      // Clone the doc
      const clonedDoc = _.cloneDeep(doc);

      clonedForm.setValues(clonedDoc);

      yield clonedForm;
    }
  }

  async save(form) {
    await this._docs.set(form.getValues());
    globals.displaySnackbar(this.getSingularLabel() + ' saved');
  }

  async delete(form) {
    await this._docs.delete(form.getField('id').getValue());
    globals.displaySnackbar(this.getSingularLabel() + ' deleted');
  }

  reachedMax() {
    const maxSize = this.get('maxSize');
    return maxSize !== null && this._docs.numTotalDocs() >= maxSize;
  }

  validate() {
    super.validate();

    const numTotalDocs = this._docs.numTotalDocs();

    const minSize = this.get('minSize');
    const maxSize = this.get('maxSize');

    if (minSize !== null && numTotalDocs < minSize) {
      this.setErr(`${minSize} or more`);
    } else if (maxSize !== null && numTotalDocs > maxSize) {
      this.setErr(`${maxSize} or less`);
    }
  }

  getSingularLabel() {
    if (this.get('singularLabel')) {
      return this.get('singularLabel');
    } else {
      // Automatically calculate singular label by removing last 's'
      const label = this.get('label');
      return label.substr(0, label.length - 1);
    }
  }
}
