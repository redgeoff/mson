import MemoryStore from './memory-store';
import localStorage from './local-storage';

export default class LocalStorageStore extends MemoryStore {
  _className = 'LocalStorageStore';

  _loadItems(storeName) {
    const store = this._localStorage.getItem(storeName);
    if (store !== null) {
      const items = JSON.parse(store);
      items.forEach(item => {
        this._items.set(item.id, item);
      });
    }
  }

  // Allow for testing in Node
  _getLocalStorage() {
    if (this._global.window && this._global.window.localStorage) {
      return this._global.window.localStorage;
    } else {
      return localStorage;
    }
  }

  _create(props) {
    super._create(props);

    // For mocking
    this._global = global;
    this._localStorage = this._getLocalStorage();

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField'
          }
        ]
      }
    });

    this._loadItems(props && props.storeName);
  }

  _saveItems() {
    const items = this._items.map(item => item);
    this._localStorage.setItem(this.get('storeName'), JSON.stringify(items));
  }

  async _doAndSave(promiseFactory) {
    const response = await promiseFactory();
    this._saveItems();
    return response;
  }

  async _createItem(props, fieldValues) {
    return this._doAndSave(() => super._createItem(props, fieldValues));
  }

  async _updateItem(props, fieldValues) {
    return this._doAndSave(() => super._updateItem(props, fieldValues));
  }

  async _archiveItem(props, fieldValues) {
    return this._doAndSave(() => super._archiveItem(props, fieldValues));
  }

  async _restoreItem(props, fieldValues) {
    return this._doAndSave(() => super._restoreItem(props, fieldValues));
  }
}
