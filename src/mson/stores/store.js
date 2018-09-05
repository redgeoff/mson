import Component from '../component';
import access from '../access';

export default class Store extends Component {
  _className = 'Store';

  _create(props) {
    super._create(props);

    // For mocking
    this._access = access;
  }

  async create(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanCreate(props.form);

    return this._createItem(props, fieldValues);
  }

  async getItem(props) {
    return this._getItem(props);
  }

  async getAll(props) {
    return this._getAllItems(props);
  }

  async update(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanUpdate(props.form);

    return this._updateItem(props, fieldValues);
  }

  async archive(props) {
    return this._archiveItem(props);
  }

  async restore(props) {
    return this._restoreItem(props);
  }
}
