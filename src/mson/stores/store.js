// Timestamps are set in the store as some stores, e.g. those backed by remote databases, may wish
// to manage the timestamps for better reliability.
//
// Structure of doc in a store, e.g.
//  {
//     id,
//     userId,
//     ...,
//     fieldValues: {
//       firstName,
//       lastName,
//       ...
//     }
//   }
// In other words, we nest the default fields in the root of the document and then nest the
// non-default fields in fieldValues. This is done because:
//   1. There are some properties, like the cursor, which should not be a field as they shouldn't be
//      displayed to the user. However, these fields need to be associated with the form.
//   2. It allows for the creation of extra properties in the future without adding them to the form
//      as default fields
//   3. Default fields are not included in the fieldValues as this allows the default fields,
//      especially the id to be at the root of the record and not nested in the fieldValues. We also
//      don’t want to duplicate these default fields in both the root of the record and in the field
//      values as this can waste memory when storing the data

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
    const fieldValues = this._access.valuesCanCreate(props.form, {
      default: false
    });

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
    const fieldValues = this._access.valuesCanUpdate(props.form, {
      default: false
    });

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

  _now() {
    return new Date();
  }

  _buildDoc({ fieldValues, userId }) {
    const id = utils.uuid();

    const createdAt = this._now();

    return {
      id,
      archivedAt: null, // Needed by the UI as a default
      createdAt,
      updatedAt: createdAt,
      userId: userId ? userId : null,
      fieldValues: Object.assign({}, fieldValues)
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

    doc.updatedAt = this._now();

    return doc;
  }
}
