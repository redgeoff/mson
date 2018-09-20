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

  _indexItemByPath(item) {
    this._itemsByPath[item.path] = item;
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

  getItem(path) {
    return this._itemsByPath[path];
  }

  getParent(path) {
    return this._parentsByPath[path];
  }

  getFirstItem() {
    return this._items[0];
  }
}
