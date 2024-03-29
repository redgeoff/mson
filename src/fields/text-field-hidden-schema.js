import TextField from './text-field';

// The TextField w/o a schema. Used to hide the schema for derived fields, e.g. EmailField, without
// a lot of boilerplate code
export default class TextFieldHiddenSchema extends TextField {
  className = 'TextFieldHiddenSchema';

  create(props) {
    this._hideTextFieldSchema = true;

    super.create(props);
  }
}
