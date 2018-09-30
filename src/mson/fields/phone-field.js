import TextField from './text-field';
import map from 'lodash/map';

export default class PhoneField extends TextField {
  _className = 'PhoneField';

  // Convert from react-telephone-input to text-mask mask
  _toMask(reactTelMask) {
    return map(reactTelMask, item => (item === '.' ? /\d/ : item));
  }

  _maskValue(value) {
    if (value) {
      if (value[0] === '+') {
        if (value.indexOf('+1') === 0) {
          return this._toMask('+. (...) ...-....');
        } else if (value.indexOf('+44') === 0) {
          return this._toMask('+.. .... ......');
        }
      } else {
        return this._toMask('(...) ...-....');
      }
    }

    return false;
  }

  _create(props) {
    super._create(props);

    this._setDefaults(props, {
      mask: value => this._maskValue(value)
    });
  }
}
