import globals from '../globals';
import registrar from '../compiler/registrar';
import queryToProps from '../component/query-to-props';
import get from 'lodash/get';

export class Getter {
  constructor({ action, component, args, globals }) {
    this._action = action;
    this._component = component;
    this._args = args;
    this._globals = globals;
  }

  get(name) {
    const names = name.split('.');
    const firstName = names[0];
    let item;
    let isComponent = false;

    switch (firstName) {
      case 'action':
        item = this._action;
        break;

      case 'arguments':
        item = this._args;
        break;

      case 'globals':
        item = this._globals;
        break;

      default:
        isComponent = true;
        item = this._component;
        break;
    }

    if (item === undefined) {
      return undefined;
    } else if (names.length > 1 || isComponent) {
      let childName = name;
      if (!isComponent) {
        names.shift(); // remove first name
        childName = names.join('.');
      }

      // Is the item a getter?
      if (item.get && typeof item.get === 'function') {
        return item.get(childName);
      } else {
        // Item is an object
        return get(item, childName);
      }
    } else {
      return item;
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

  // TODO: refactor so that we just expose the globals component and a session property. This way,
  // we don't process the properties until they are needed. The session property can probably be on
  // globals and simply return a session when it is retrieved, e.g. see FormEditor and the
  // definition property for a similar example.
  _getGlobals() {
    return {
      session: this._getSession(),
      ...globals.get()
    };
  }

  getFillerProps(props) {
    // Wrap in a Getter so that we expose a single get() to PropFiller
    return new Getter({
      action: props && props.parent,
      component: props && props.component,
      args: props && props.arguments,
      globals: this._getGlobals()
    });
  }

  getWhereProps(where, props) {
    // Wrap in a Getter so that we expose a single get() to queryToProps()
    const component = new Getter({
      action: props.parent,
      component: props.component,
      args: props.arguments,
      globals: this._getGlobals()
    });

    return queryToProps(where, component);
  }
}
