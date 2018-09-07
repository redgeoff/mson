import Component from '../component';
import access from '../access';
import utils from '../utils';

export default class Store extends Component {
  _className = 'Store';

  _create(props) {
    super._create(props);

    // For mocking
    this._access = access;

    if (!props || !props.muteDidLoad) {
      this._emitDidLoad();
    }
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

  _emitError(err) {
    this.emitChange('err', err);
  }

  _buildDoc({ fieldValues, userId }) {
    const id = utils.uuid();
    const createdAt = new Date();
    return {
      id,
      archivedAt: null, // Needed by the UI as a default
      createdAt,
      updatedAt: createdAt,
      userId: userId ? userId : null,
      fieldValues: Object.assign({}, fieldValues, { id })
    };
  }

  _setDoc(doc, { fieldValues, archivedAt }) {
    if (fieldValues !== undefined) {
      // Merge so that we support partial updates
      doc.fieldValues = Object.assign(doc.fieldValues, fieldValues);
    }

    if (archivedAt !== undefined) {
      doc.archivedAt = archivedAt;
    }

    doc.updatedAt = new Date();

    return doc;
  }
}
