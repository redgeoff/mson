import each from 'lodash/each';

//   { "id": 1, "parentId": null, "obj": "Germany" },
//   { "id": 2, "parentId": null, "obj": "USA" },
//
//   { "id": 3, "parentId": 1, "obj": "BMW" },
//   { "id": 4, "parentId": 1, "obj": "Mercedes" },
//
//   { "id": 5, "parentId": 2, "obj": "Tesla" },
//
//   { "id": 6, "parentId": 3, "obj": "i3" },
//   { "id": 7, "parentId": 3, "obj": "i8" },
//   { "id": 8, "parentId": 4, "obj": "S-Class" },
//
//   { "id": 9, "parentId": 5, "obj": "Model S" }
//
export default class Hierarchy {
  noParentId = -1;

  constructor(items) {
    this.clear();
    if (items) {
      this.add(items);
    }
  }

  clear() {
    this._items = {};
    this._itemsByParent = {};
  }

  _toParentId(parentId) {
    return parentId ? parentId : this.noParentId;
  }

  _addItem(item) {
    this._items[item.id] = item;

    const parentId = this._toParentId(item.parentId);
    if (!this._itemsByParent[parentId]) {
      this._itemsByParent[parentId] = [];
    }
    this._itemsByParent[parentId].push(item);
  }

  add(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    items.forEach(item => this._addItem(item));
  }

  get(id) {
    return this._items[id];
  }

  eachByParent(parentId, onItem) {
    // Use each() so that we can return false to exit loop prematurely
    parentId = this._toParentId(parentId);
    each(this._itemsByParent[parentId], onItem);
  }

  mapByParent(parentId, onItem) {
    parentId = this._toParentId(parentId);
    const items = this._itemsByParent[parentId];
    if (items) {
      return items.map(onItem);
    } else {
      return [];
    }
  }
}
