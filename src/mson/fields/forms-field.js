// TODO: what to do about doc store? Is it even needed as all data is stored locally via form. Maybe
// the store provides a good abstraction though the DB. If so then probably want to refactor to have
// something like field.bind(store)

import Field from './field';
// import DocStore from '../doc-store';
import globals from '../globals';
import Mapa from '../mapa';
import uuid from 'uuid';

export default class FormsField extends Field {
  // // TODO: how does this get cleaned up?
  // _bubbleUpChanges() {
  //   this._docs.on('change', change => {
  //     this._emitChange('change', change);
  //   });
  // }

  constructor(props) {
    super(props);

    // // TODO: should _docs be a reference that is passed in so that the store can be swapped out?
    // this._docs = new DocStore();

    // We use a Mapa instead of an array as it allows us to index the forms by id. We use a Mapa
    // instead of a Map as we may want to iterate through the forms beginning at any single form.
    this._forms = new Mapa();

    // this._bubbleUpChanges();
  }

  addForm(values) {
    const clonedForm = this.get('form').clone();
    clonedForm.setValues(values);

    const id = clonedForm.getField('id');
    let key = 0;
    if (id.isBlank()) {
      // The id value is blank so use the current _forms length as the key
      key = this._forms.length();
    } else {
      key = id.getValue();
    }

    this._forms.set(key, clonedForm);
  }

  _setValue(value) {
    // TODO: what's the best way to set? e.g. if we set the same values over and over then we end up
    // recreating the forms each time. Would it be better to just use index to set and if there are
    // indexes that are in the current forms, but not in values then just delete?
    if (value && value.length > 0) {
      value.forEach(values => this.addForm(values));
    } else {
      this._forms.clear();
    }
  }

  removeForm(id) {
    this._forms.delete(id);
  }

  getForm(id) {
    return this._forms.get(id);
  }

  set(props) {
    super.set(props);

    if (props.value !== undefined) {
      this._setValue(props.value);
    }

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

  // getStore() {
  //   return this._docs;
  // }

  *getForms() {
    yield* this._forms.values();
  }

  async save(form) {
    // await this._docs.set(form.getValues());
    const id = form.getField('id');
    if (id.isBlank()) {
      // TODO: use the id from this._docs.set instead of this dummy id
      id.setValue(uuid.v4());
    }

    if (this._forms.has(id.getValue())) {
      const fieldForm = this._forms.get(id.getValue());
      fieldForm.setValues(form.getValues());
    } else {
      this.addForm(form.getValues());
    }

    globals.displaySnackbar(this.getSingularLabel() + ' saved');
  }

  async delete(form) {
    // await this._docs.delete(form.getField('id').getValue());
    this.removeForm(form.getField('id').getValue());
    globals.displaySnackbar(this.getSingularLabel() + ' deleted');
  }

  reachedMax() {
    const maxSize = this.get('maxSize');
    return maxSize !== null && this._forms.length() >= maxSize;
  }

  validate() {
    super.validate();

    let errors = [];
    for (const form of this._forms.values()) {
      form.validate();
      if (form.hasErr()) {
        errors = errors.concat(form.getErrs());
      }
    }

    const numForms = this._forms.length();

    const minSize = this.get('minSize');
    const maxSize = this.get('maxSize');

    if (minSize !== null && numForms < minSize) {
      this.setErr(`${minSize} or more`);
    } else if (maxSize !== null && numForms > maxSize) {
      this.setErr(`${maxSize} or less`);
    } else if (errors.length > 0) {
      this.setErr('form error ' + errors.join(', '));
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
