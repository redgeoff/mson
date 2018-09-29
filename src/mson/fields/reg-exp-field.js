import TextField from './text-field';

export default class RegExpField extends TextField {
  _toRegExp(string) {
    // JSON doesn't support RegExp types so convert string representations to RegExp, including
    // flags
    const match = string.match(new RegExp('^/(.*)/(.*)$'));
    return new RegExp(match[1], match[2]);
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert string to RegExp?
    if (
      clonedProps.value !== undefined &&
      !(clonedProps.value instanceof RegExp)
    ) {
      clonedProps.value = this._toRegExp(clonedProps.value);
    }

    super.set(clonedProps);
  }
}
