import NumberField from './number-field';

export default class IntegerField extends NumberField {
  validate() {
    super.validate();
    this._validateWithRegExp(/^([+-]?[1-9]\d*|0)$/, 'not an integer');
  }
}
