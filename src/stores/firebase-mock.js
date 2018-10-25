// Mock Firebase so that we don't have to test against the actual service

import Mapa from '../mapa';

class SnapshotMock {
  constructor(docs) {
    this._docs = docs;
  }

  docChanges() {
    return this._docs.map(doc => ({
      type: doc.type,
      doc: {
        data: () => doc.data
      }
    }));
  }
}

class CollectionMock {
  _listenToChanges() {
    // Not currently needed by our tests, but may be used in the future.
    //
    // Simulate the response from Firebase after a write
    // this._docs.on('$change', (name, value) => {
    //   switch (name) {
    //     case 'createDoc':
    //       this.emitSnapshot([ { type: 'added', data: value.value } ])
    //       break;
    //     case 'updateDoc':
    //       this.emitSnapshot([ { type: 'modified', data: value.value } ])
    //       break;
    //     case 'deleteDoc':
    //       this.emitSnapshot([ { type: 'removed', data: value.value } ])
    //       break;
    //     default:
    //       break;
    //   }
    // });
  }

  constructor(docs) {
    this._docs = docs;

    this._listenToChanges();
  }

  orderBy() {
    return this;
  }

  emitSnapshot(docs) {
    this._onSnapshot(new SnapshotMock(docs));
  }

  emitError(err) {
    this._onError(err);
  }

  onSnapshot(onSnapshot, onError) {
    this._onSnapshot = onSnapshot;
    this._onError = onError;

    // Emit initial data
    this.emitSnapshot(
      this._docs.map(doc => ({ type: 'added', data: doc.value }))
    );
  }

  doc(id) {
    return {
      set: async doc => {
        return this._docs.set(id, doc);
      }
    };
  }
}

export default class FirebaseMock {
  constructor(docs) {
    this._docs = new Mapa();

    if (docs) {
      docs.forEach(doc => this._docs.set(doc.id, doc));
    }

    this._collection = new CollectionMock(this._docs);

    this.apps = {
      length: 0
    };
  }

  initializeApp() {
    this.apps.length = 1;
  }

  firestore() {
    return {
      settings: () => {},
      collection: () => this._collection
    };
  }

  emitSnapshot(docs) {
    this._collection.emitSnapshot(docs);
  }

  emitError(err) {
    this._collection.emitError(err);
  }
}
