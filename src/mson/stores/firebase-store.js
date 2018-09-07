// NOTE: Firebase doesn't support complex quering like most DBs (
// https://firebase.google.com/docs/firestore/query-data/queries). Therefore, we will do all the
// querying in memory. In the future we may want to support a minimal set of queries against the
// firestore DB so that we have the option of working with larger datasets.

import MemoryStore from './memory-store';
import cloneDeep from 'lodash/cloneDeep';

export default class FirebaseStore extends MemoryStore {
  _className = 'FirebaseStore';

  // React to real-time changes made remotely
  async _listenToChanges(collection) {
    // We order by createdAt as per https://firebase.google.com/docs/firestore/manage-data/add-data,
    // "Firestore auto-generated IDs do not provide any automatic ordering. If you want to be able
    // to order your documents by creation date, you should store a timestamp as a field in the
    // documents"
    this._coll.orderBy('createdAt').onSnapshot(
      snapshot => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'removed') {
            this._items.delete(data.id);
          } else {
            // added or modified
            this._items.set(data.id, data);
          }
        });

        // First load?
        if (!this.isLoaded()) {
          // Emit on next tick so that caller has a change to listen
          setTimeout(() => {
            this._emitDidLoad();
          });
        }
      },
      err => {
        this._emitError(err);
      }
    );
  }

  // async _loadItems() {
  //   const docs = await this._coll.get();
  //   docs.forEach(doc => {
  //     const item = doc.data();
  //     this._items.set(item.id, item);
  //   });
  // }

  async _init(props) {
    this._fb = props.firebase ? props.firebase : global.firebase;

    this._fb.initializeApp({
      apiKey: props.apiKey,
      authDomain: props.authDomain,
      projectId: props.projectId
    });

    this._db = this._fb.firestore();

    // Disable warning
    const settings = { timestampsInSnapshots: true };
    this._db.settings(settings);

    this._coll = this._db.collection(props.collection);

    this._listenToChanges(props.collection);

    // Not needed as we get the items by listening to the changes
    // await this._loadItems();
  }

  _create(props) {
    super._create(
      Object.assign({}, props, {
        // Mute didLoad in the base classes as we need to emit didLoad after all the docs have been
        // loaded asynchronously
        muteDidLoad: true
      })
    );

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            // For mocking
            name: 'firebase',
            component: 'Field'
          },
          {
            name: 'apiKey',
            component: 'TextField'
          },
          {
            name: 'authDomain',
            component: 'TextField'
          },
          {
            name: 'projectId',
            component: 'TextField'
          },
          {
            name: 'collection',
            component: 'TextField'
          }
        ]
      }
    });

    // Don't actually connect to Firebase unless we specify an API Key
    if (props.apiKey !== undefined) {
      this._init(props);
    }
  }

  async _docSet(id, doc, options) {
    // Don't actually connect to Firebase unless we specify an API Key
    if (this.get('apiKey')) {
      // Update the Firebase store
      return this._coll.doc(id).set(doc, options);
    }
  }

  async _createItem(props, fieldValues) {
    const item = this._buildDoc({ fieldValues });

    await this._docSet(item.id, item);

    // Note: we need to update the underlying MemoryStore so that the data is there after this
    // function completes even though Firebase will emit an onWrite with the changed data.
    this._items.set(item.id, item);

    return item;
  }

  async _modifyItem(props, { fieldValues, archivedAt }) {
    // We use cloneDeep so that we don't modify the data in the memory store before we modify the
    // data in the Firebase store. The write to Firebase could always fail.
    let item = cloneDeep(this._items.get(props.id));

    item = this._setDoc(item, { fieldValues, archivedAt });

    await this._docSet(item.id, item, {
      merge: true // allow for partial updates
    });

    // Note: we need to update the underlying MemoryStore so that the data is there after this
    // function completes even though Firebase will emit an onWrite with the changed data.
    this._items.set(item.id, item);

    return item;
  }

  async _updateItem(props, fieldValues) {
    return this._modifyItem(props, { fieldValues });
  }

  async _archiveItem(props /*, fieldValues */) {
    return this._modifyItem(props, { archivedAt: new Date() });
  }

  async _restoreItem(props /*, fieldValues */) {
    return this._modifyItem(props, { archivedAt: null });
  }
}
