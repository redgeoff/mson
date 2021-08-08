import Form from './form';
import Field from '../fields/field';

class ComponentDefinitionField extends Field {
  // Leave className with the inherited value of "Field" so that the UI knows how to render (hide)
  // it. FUTURE: we may want to define something like a HiddenField that the we can use to represent
  // a Field that should not be rendered.
  //
  // className = 'ComponentDefinitionField';

  _setValue(value) {
    if (value !== null) {
      // Also allow for "componentName" as "component" is a MSON keyword and results in compilation
      value = {
        ...value,
        component: value.component ? value.component : value.componentName,
        componentName: undefined,
      };
    }

    super._setValue(value);
  }
}

// Note: we use JS to define the component so that we can use `instanceof ComponentForm`
export default class ComponentForm extends Form {
  className = 'ComponentForm';

  create(props) {
    super.create(props);

    const fields = [
      // A JSON blob defining the component. We define a ComponentDefinitionField so that we can
      // dynamically modify the value, to workaround the fact that the "component" keyword cannot be
      // used in MSON.
      new ComponentDefinitionField({
        name: 'definition',
        label: 'Definition',
        required: true,
      }),
    ];

    // By default, lock down access
    const access = {
      form: {
        create: 'admin',
        read: 'admin',
        update: 'admin',
        archive: 'admin',
      },
    };

    this.set({
      access,
      fields,
    });
  }
}
