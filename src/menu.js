import Component from './component';
import each from 'lodash/each';
import querystring from 'querystring';

// e.g. [
//   {
//     path: 'red',
//     label: 'Red',
//     items: [
//       {
//         path: 'light-red',
//         label: 'Light Red',
//         content: {
//           component: 'CollectionField',
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
  _className = 'Menu';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'items',
            component: 'CollectionField',
            formFactory: {
              component: 'Factory',
              product: {
                component: 'Form',
                fields: [
                  {
                    name: 'path',
                    component: 'TextField',
                    label: 'Path',
                    required: true
                  },
                  {
                    name: 'label',
                    component: 'TextField',
                    label: 'Label',
                    required: true
                  },
                  {
                    name: 'content',
                    component: 'Field',
                    label: 'Content',
                    required: true
                  },
                  {
                    name: 'fullScreen',
                    component: 'BooleanField',
                    label: 'Full Screen'
                  },
                  {
                    name: 'roles',
                    component: 'RolesField',
                    label: 'Roles'
                  },
                  {
                    name: 'hidden',
                    component: 'BooleanField',
                    label: 'Hidden'
                  }
                ]
              }
            }
          }
        ]
      }
    });
  }

  _toRegExpPath(path) {
    const paramNames = [];

    const regExpPath = path.replace(/:([^/])*/g, match => {
      paramNames.push(match.substr(1));
      return '([^\\/]*)';
    });

    return {
      paramNames,
      regExpPath: new RegExp('^' + regExpPath + '$')
    };
  }

  _indexItemByPath(item) {
    let extras = {};
    if (item.path) {
      extras = this._toRegExpPath(item.path);
    }
    this._itemsByPath[item.path] = { ...item, ...extras };

    if (item.items) {
      item.items.forEach(item => this._indexItemByPath(item));
    }
  }

  _indexByPath() {
    this._items.forEach(item => this._indexItemByPath(item));
  }

  _indexParentByPath(item, parentItem) {
    this._parentsByPath[item.path] = parentItem;
    if (item.items) {
      item.items.forEach(childItem => this._indexParentByPath(childItem, item));
    }
  }

  _indexParentsByPath() {
    this._items.forEach(item => this._indexParentByPath(item));
  }

  set(props) {
    super.set(props);

    // Index by path so we can do a quick lookup later
    if (props.items !== undefined) {
      this._itemsByPath = {};
      this._indexByPath();
      this._parentsByPath = {};
      this._indexParentsByPath();
    }
  }

  getItemAndParsePath(path) {
    let itemFound = null;
    let params = {};

    each(this._itemsByPath, item => {
      if (item.path) {
        const match = path.match(item.regExpPath);
        if (match) {
          itemFound = item;
          item.paramNames.forEach((name, i) => (params[name] = match[i + 1]));
          return false; // exit loop
        }
      }
    });

    return {
      item: itemFound,
      params
    };
  }

  getItem(path) {
    const { item } = this.getItemAndParsePath(path);
    return item;
  }

  toRoute({ parameters, queryString, hash }) {
    const query = querystring.parse(queryString);

    return {
      parameters,
      query,
      hash
    };
  }

  getParent(path) {
    return this._parentsByPath[path];
  }

  getFirstItem() {
    return this._items[0];
  }
}
