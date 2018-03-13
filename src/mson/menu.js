import Component from './component';

// e.g. [
//   {
//     path: 'red',
//     label: 'Red',
//     items: [
//       {
//         path: 'light-red',
//         label: 'Light Red',
//         content: {
//           component: 'FormsField',
//           form: {
//             component: 'org.proj.ColorField'
//           }
//         }
//       },
//       {
//         path: 'dark-red',
//         label: 'Dark Red'
//       }
//     ]
//   }
// ]
export default class Menu extends Component {
  _indexItemByPath(item) {
    this._itemsByPath[item.path] = item;
    if (item.items) {
      item.items.forEach(item => this._indexItemByPath(item));
    }
  }

  _indexByPath() {
    this._items.forEach(item => this._indexItemByPath(item));
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'items');

    // Index by path so we can do a quick lookup later
    if (props.items !== undefined) {
      this._itemsByPath = [];
      this._indexByPath();
    }
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'items');
    return value === undefined ? super.getOne(name) : value;
  }

  getItem(path) {
    return this._itemsByPath[path];
  }

  getFirstItem() {
    return this._items[0];
  }
}
