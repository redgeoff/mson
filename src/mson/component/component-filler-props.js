import globals from '../globals';
import registrar from '../compiler/registrar';
import Form from '../form';

export default class ComponentFillerProps {
  _getSession() {
    return registrar.client ? registrar.client.user.getSession() : undefined;
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

        if (props.component instanceof Form) {
          // Replace the component with values that can be used to fill
          fillerProps.fields = this._formToFillerProps(props.component);
        }
      }

      fillerProps.arguments = props.arguments;
    }

    fillerProps.globals = this._getGlobals();

    return fillerProps;
  }
}
