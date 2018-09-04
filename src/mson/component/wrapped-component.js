import BaseComponent from './base-component';
import utils from '../utils';

// Used to create a component that can be dynamically defined on demand. WrappedComponent
// essentially exposes componentToWrap, which means that mutating the wrapped component mutates
// componentToWrap.
export default class WrappedComponent extends BaseComponent {
  _className = 'WrappedComponent';

  _getWrappedComponentSchema() {
    return {
      component: 'Form',
      fields: [
        {
          name: 'componentToWrap',
          component: 'Field'
        }
      ]
    };
  }

  _create(props) {
    super._create(props);

    this._preserveClassName = true;

    this.set({
      schema: this._getWrappedComponentSchema()
    });

    if (props.componentToWrap !== undefined) {
      this.setComponentToWrap(props.componentToWrap);
    }
  }

  setComponentToWrap(componentToWrap) {
    // Is componentToWrap a string? This will happen when componentToWrap is a template parameter,
    // e.g. {{baseForm}}, and we are validating the component definition and don't have an instance
    // to inject
    if (typeof componentToWrap !== 'string') {
      this._componentToWrap = componentToWrap;
      this._wrapComponent();
    }
  }

  _getAllMethodOrFunctionNames() {
    // componentToWrap can either be a class or object or functions and in each case we need a
    // different way of identifying the function/method names. In particular when wrapping a
    // component, _wrapComponent will result in wrapping the methods as functions.
    let names = utils.getAllMethodNames(this._componentToWrap);
    return names.concat(utils.getAllFunctionNames(this._componentToWrap));
  }

  _wrapComponent() {
    const names = this._getAllMethodOrFunctionNames();

    names.forEach(name => {
      // Skip system function names
      if (
        ['caller', 'callee', 'arguments', 'constructor'].indexOf(name) === -1 &&
        name.indexOf('__') === -1
      ) {
        const property = this._componentToWrap[name];
        if (this._componentToWrap[name]) {
          this[name] = (...args) => {
            return property.apply(this._componentToWrap, args);
          };
        }
      }
    });

    if (this._preserveClassName) {
      // Preserve the original className
      //
      // Note: we cannot use Class.prototype.name as this is overwritten by minifiers like UglifyJS.
      //
      // Object.defineProperty(this._componentToWrap.constructor, 'name', {
      //   value: thisClassName,
      //   writable: false
      // });
      //
      this.getClassName = this._componentToWrap.getClassName.bind(this);
    }
  }
}
