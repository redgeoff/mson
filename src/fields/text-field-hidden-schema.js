import TextField from './text-field';

// The TextField w/o a schema. Used to hide the schema for derived fields, e.g. EmailField, without
// a lot of boilerplate code
export default class TextFieldHiddenSchema extends TextField {
  _className = 'TextFieldHiddenSchema';

  _create(props) {
    this._hideTextFieldSchema = true;

    super._create(props);
  }
}
