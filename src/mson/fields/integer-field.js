import Field from './field';

export default class IntegerField extends Field {
  validate() {
    super.validate();
    this._validateWithRegExp(/^([+-]?[1-9]\d*|0)$/, 'not an integer');
  }
}
