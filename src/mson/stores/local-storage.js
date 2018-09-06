// A minimal implementation of localStorage used to test in node
class LocalStorage {
  constructor() {
    this._items = {};
  }

  getItem(key) {
    const value = this._items[key];
    return value === undefined ? null : value;
  }

  setItem(key, value) {
    this._items[key] = value;
  }
}

export default new LocalStorage();
