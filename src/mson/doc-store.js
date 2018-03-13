import events from 'events';
import Mapa from './mapa';
import _ from 'lodash';
import uuid from 'uuid';

// TODO:
//   - Bulk set, get and delete

export default class DocStore extends events.EventEmitter {
  constructor() {
    super();
    this._docs = new Mapa();
  }

  _emitChange(event, doc, nextId, oldDoc, oldNextId) {
    this.emit('change', {
      event,
      doc,
      nextId,
      oldDoc,
      oldNextId
    });
  }

  async set(doc, beforeId) {
    // We clone the doc as don't want to mutate the passed data
    const clonedDoc = _.cloneDeep(doc);

    let nextId = undefined;
    let oldDoc = undefined;
    let oldNextId = undefined;
    let event = 'update';

    // No id?
    if (!clonedDoc.id) {
      clonedDoc.id = uuid.v4();
    }

    if (this._docs.has(clonedDoc.id)) {
      // Clone so that listener doesn't receive a reference to the actual data
      oldDoc = _.clone(this._docs.get(clonedDoc.id));
      oldNextId = this._docs.nextKey(clonedDoc.id);
    } else {
      event = 'create';
    }

    this._docs.set(clonedDoc.id, clonedDoc, beforeId);

    // Are we appending?
    if (beforeId === undefined) {
      nextId = this._docs.nextKey(clonedDoc.id);
    } else {
      beforeId = nextId;
    }

    this._emitChange(event, clonedDoc, nextId, oldDoc, oldNextId);

    return clonedDoc;
  }

  async get(id) {
    return this._docs.get(id);
  }

  async has(id) {
    return this._docs.has(id);
  }

  all() {
    return this._docs.values();
  }

  async delete(id) {
    const doc = await this.get(id);

    const oldDoc = _.clone(doc);
    const oldNextId = this._docs.nextKey(id);

    this._docs.delete(id);

    this._emitChange('delete', undefined, undefined, oldDoc, oldNextId);
  }

  numTotalDocs() {
    // TODO: this probably needs to change as we may need the total number of docs even though we
    // are only storing some of them in the store, e.g. during pagination
    return this._docs.length();
  }
}
