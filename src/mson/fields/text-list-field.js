import ListField from './list-field';
import TextField from './text-field';

export default class TextListField extends ListField {
  _newField(index) {
    return new TextField({
      name: index,
      label: index === 0 ? this.get('label') : undefined,
      required: false,
      block: this.get('block') === undefined ? true : this.get('block'),
      fullWidth: this.get('fullWidth'),
      options: this.get('options')
    });
  }
}
