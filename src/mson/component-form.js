// NOTE: component-form is a separate module and not located in component as otherwise there would
// be a circular dependency.

import Form from './form';
import { TextField, FormsField } from './fields';
// import ObjectForm from './object-form';

// class ActionForm extends ObjectForm {
//
// }

class ListenerForm extends Form {
  _create(props) {
    super._create(props);
    this.addField(
      new TextField({
        name: 'fields'
      })
    );
    // this.addField(new FormsField({ name: 'actions', form: new ActionForm() }))
  }
}

export default class ComponentForm extends Form {
  _create(props) {
    super._create(props);
    this.addField(new TextField({ name: 'name' }));
    this.addField(
      new FormsField({ name: 'listeners', form: new ListenerForm() })
    );
  }
}
