import UIComponent from './ui-component';
import Mapa from './mapa';

export default class Fragment extends UIComponent {
  className = 'Fragment';

  setNamedItems(items) {
    this._items.clear();
    items.forEach((item, index) => {
      item.set({ parent: this });
      const key = item.get('name') ? item.get('name') : index;
      this._items.set(key, item);
    });
  }

  create(props) {
    // Use a Mapa so that we can reference the items by name, e.g. `items.myComponentName`
    this._items = new Mapa();

    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'items',
            component: 'Field',
          },
        ],
      },
    });
  }

  set(props) {
    const { items } = props;

    if (items !== undefined) {
      this.setNamedItems(items);
    }

    super.set({ ...props, items: undefined });
  }
}
