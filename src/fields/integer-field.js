import NumberField from './number-field';

export default class IntegerField extends NumberField {
  _className = 'IntegerField';

  validate() {
    super.validate();
    this._validateWithRegExp(/^([+-]?[1-9]\d*|0)$/, 'not an integer');
  }
}
