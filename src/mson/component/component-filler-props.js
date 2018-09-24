import globals from '../globals';
import registrar from '../compiler/registrar';

export default class ComponentFillerProps {
  constructor() {
    // For mocking
    this._registrar = registrar;
  }

  _getSession() {
    const reg = this._registrar;
    return reg.client ? reg.client.user.getSession() : undefined;
  }

  _getGlobals() {
    return {
      session: this._getSession(),
      ...globals.get()
    };
  }

  _formToFillerProps(component) {
    const fields = {};
    component.eachField(
      field => (fields[field.get('name')] = { value: field.get('value') })
    );
    return fields;
  }

  getFillerProps(props) {
    let fillerProps = {};

    if (props) {
      if (props.component) {
        fillerProps = Object.assign(fillerProps, props.component.get());

        // Is the component a form? We cannot use instanceof as otherwise it would create a circular
        // dependency
        // if (props.component instanceof Form) {
        if (props.component.has('fields')) {
          // Replace the component with values that can be used to fill
          fillerProps.fields = this._formToFillerProps(props.component);
        }
      }

      if (props.parent) {
        // Inject the parent so that nested components, e.g. nested actions, have access to the
        // parent properties
        fillerProps.parent = props.parent.get();
      }

      fillerProps.arguments = props.arguments;
    }

    fillerProps.globals = this._getGlobals();

    return fillerProps;
  }
}
