// TODO: do we really need the RecordEditor or can we just enhance a Form to do all this? May need
// something like a copyField or something so that can take an existing form and then add buttons,
// etc...
// => Probably keep RecordEditor as good to have one type of template that has buttons that gray
//    when appropriate, etc...

// TODO:
//   - Pass all properties to form and back?
//   - Also support setting validators at this layer?

import Component from '../component';

export default class RecordEditor extends Component {
  set(props) {
    super.set(props);

    this._setIfUndefined(props, 'form');

    if (props.form !== undefined) {
      // TODO: clean up previous listeners
      this._bubbleUpEvents(this.get('form'), ['dirty', 'err']);
    }

    if (props.dirty !== undefined) {
      this.get('form').setDirty(props.dirty);
      this._emitChange('dirty', props.dirty);
    }

    if (props.value !== undefined) {
      this.get('form').setValues(props.value);
    }
  }

  getOne(name) {
    if (name === 'value') {
      return this.get('form').getValues();
    }

    // Get from child
    if (['dirty', 'err'].indexOf(name) !== -1) {
      return this.get('form').get(name);
    }

    const value = this._getIfAllowed(name, 'form');
    return value === undefined ? super.getOne(name) : value;
  }

  save() {
    this._emitChange('save');
  }

  cancel() {
    this._emitChange('cancel');
  }

  emitLoad() {
    // Prepare the form so that there is nothing left from any previous editing.
    const form = this.get('form');
    form.clearValues();
    form.clearErrs();
    this.set({ dirty: false });
    form.setTouched(false);

    super.emitLoad();
  }
}
