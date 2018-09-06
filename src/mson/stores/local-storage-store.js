import MemoryStore from './memory-store';

export default class LocalStorageStore extends MemoryStore {
  _className = 'LocalStorageStore';

  _loadItems(storeName) {
    const store = localStorage.getItem(storeName);
    if (store !== null) {
      const items = JSON.parse(store);
      items.forEach(item => {
        this._items.set(item.id, item);
      });
    }
  }

  _create(props) {
    super._create(props);

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
    localStorage.setItem(this.get('storeName'), JSON.stringify(items));
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
