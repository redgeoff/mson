import TextField from './text-field';

export default class PhoneField extends TextField {
  _className = 'PhoneField';

  _maskValue(value) {
    if (value) {
      if (value[0] === '+') {
        if (value.indexOf('+1') === 0) {
          return [
            '+',
            '1',
            ' ',
            '(',
            /\d/,
            /\d/,
            /\d/,
            ')',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/,
            /\d/,
            /\d/
          ];
        } else if (value.indexOf('+44') === 0) {
          return [
            '+',
            '4',
            '4',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            /\d/,
            ' ',
            /\d/,
            /\d/,
            /\d/,
            /\d/,
            /\d/,
            /\d/
          ];
        }
      } else {
        return [
          '(',
          /\d/,
          /\d/,
          /\d/,
          ')',
          ' ',
          /\d/,
          /\d/,
          /\d/,
          '-',
          /\d/,
          /\d/,
          /\d/,
          /\d/
        ];
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
