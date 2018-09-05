import Component from '../component';
import access from '../access';

export default class Store extends Component {
  _className = 'Store';

  _create(props) {
    super._create(props);

    // For mocking
    this._access = access;
  }

  async createItem(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanCreate(props.form);

    return this._createItem(props, fieldValues);
  }

  async getItem(props) {
    return this._getItem(props);
  }

  async getAllItems(props) {
    return this._getAllItems(props);
  }

  async updateItem(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanUpdate(props.form);

    return this._updateItem(props, fieldValues);
  }

  async archiveItem(props) {
    return this._archiveItem(props);
  }

  async restoreItem(props) {
    return this._restoreItem(props);
  }
}
