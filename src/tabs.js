import Component from './component';

export default class Tabs extends Component {
  _className = 'Tabs';

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
                    name: 'name',
                    component: 'TextField',
                    label: 'Name',
                    required: true
                  },
                  {
                    name: 'label',
                    component: 'TextField',
                    label: 'Label',
                    required: true
                  },
                  {
                    // TODO: create IconListField (with preview) and use it here
                    name: 'icon',
                    component: 'TextField',
                    label: 'Icon',
                    docLevel: 'basic'
                  }
                ]
              }
            }
          },
          {
            name: 'value',
            component: 'NumberField',
            help: 'The index of the tab selected'
          }
        ]
      }
    });

    this._setDefaults(props, {
      value: 0
    });
  }
}
