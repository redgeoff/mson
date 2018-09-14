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

  async createDoc(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanCreate(props.form);

    return this._createDoc(props, fieldValues);
  }

  async getDoc(props) {
    return this._getDoc(props);
  }

  async getAllDocs(props) {
    return this._getAllDocs(props);
  }

  async updateDoc(props) {
    // Omit values based on access
    const fieldValues = this._access.valuesCanUpdate(props.form);

    return this._updateDoc(props, fieldValues);
  }

  async archiveDoc(props) {
    return this._archiveDoc(props);
  }

  async restoreDoc(props) {
    return this._restoreDoc(props);
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
