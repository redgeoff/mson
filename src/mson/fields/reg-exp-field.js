import TextField from './text-field';
import utils from '../utils';

export default class RegExpField extends TextField {
  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert string to RegExp?
    if (
      clonedProps.value !== undefined &&
      !(clonedProps.value instanceof RegExp)
    ) {
      clonedProps.value = utils.toRegExp(clonedProps.value);
    }

    super.set(clonedProps);
  }
}
