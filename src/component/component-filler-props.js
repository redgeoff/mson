import globals from '../globals';
import registrar from '../compiler/registrar';
import queryToProps from '../component/query-to-props';

export class Getter {
  constructor({ action, component }) {
    this._action = action;
    this._component = component;
  }

  get(name) {
    const parts = name.split('.');
    const firstName = parts[0];
    if (firstName === 'action') {
      return this._action ? this._action.get(name) : undefined;
    } else if (['globals', 'arguments'].indexOf(firstName) === -1) {
      return this._component ? this._component.get(name) : undefined;
    }
  }
}

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
    component.eachField(field => (fields[field.get('name')] = field.get()));
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
        fillerProps.action = {
          parent: props.parent.get()
        };
      }

      fillerProps.arguments = props.arguments;
    }

    fillerProps.globals = this._getGlobals();

    return fillerProps;
  }

  getWhereProps(where, props) {
    let whereProps = {};

    // Wrap in a Getter so that we expose a get() for queryToProps()
    const component = new Getter({
      action: props.parent,
      component: props.component
    });

    whereProps = queryToProps(where, component);

    whereProps.arguments = props.arguments;

    whereProps.globals = this._getGlobals();

    return whereProps;
  }
}
