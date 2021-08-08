import IdField from './id-field';
import utils from '../utils';

export default class UUIDField extends IdField {
  className = 'UUIDField';

  create(props) {
    super.create(props);

    this._setDefaults(props, {
      value: utils.uuid(),
    });
  }
}
