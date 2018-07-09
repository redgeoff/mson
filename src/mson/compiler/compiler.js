// TODO:
//  - Would it be advantageous to allow for copying of sub components, e.g. fields, instead of
//    using inheritance so that can mix in parts of different components. This would be like a
//    React design pattern. Or, would this make things too complex?

// Notes:
//  - An older design did a one-time build of MSON components and then stored them in
//    _compiledComponents, unfortunately, this optimization had to be removed as MSON components can
//    now have dynamic attributes. TODO: as a future optimization we can check to see if a MSON
//    component has dynamic attributes and if it doesn't then we can cache the compiled component.

import components from '../components';
import _ from 'lodash';
import utils from '../utils';
import PropFiller from './prop-filler';
import registrar from './registrar';

export class Compiler {
  constructor(props) {
    this._components = props.components;
  }

  // // We keep this separate from components so that we have a way of referencing uncompiled
  // // components after the components have been compiled. Moreover, this construct doesn't require
  // // any special organization in the components object.
  // _compiledComponents = {};

  _getComponent(name) {
    if (this._components[name]) {
      return this._components[name];
    } else {
      throw new Error('missing component ' + name);
    }
  }

  _getUncompiledComponent(name) {
    const component = this._getComponent(name);
    if (!this.isCompiled(component)) {
      return component;
    } else {
      throw new Error('missing MSON component ' + name);
    }
  }

  _removeComponentDefinitions(props) {
    if (typeof props === 'object' && props !== null) {
      if (props.component) {
        delete props.component;
      }
      _.each(props, (prop, name) => {
        this._removeComponentDefinitions(prop);
      });
    }
  }

  // TODO: should this really be called in multiple places?
  _fillProps(props, component) {
    const propFiller = new PropFiller(props);

    // We don't need to clone as fillAll does this for us
    component = propFiller.fillAll(component);

    // Capture props and set passed so that actions ifData is automatically injected for actions.
    // We remove component definitions so that we prevent infinite recursion.
    var clonedProps = _.cloneDeep(props);
    this._removeComponentDefinitions(clonedProps);
    component.passed = clonedProps;

    return component;
  }

  _instantiateComponent(props) {
    const Component = this.getComponent(props.component, props);

    // TODO: maybe 'component' should be renamed to something like 'compiledComponent' so that we
    // still have a reference to original hierarchy. Alternatively, maybe we can track this
    // hierarchy via something like a prototype chain in the actual JS object.
    delete props.component;

    return new Component(props);
  }

  _buildComponent(name, defaultProps) {
    const Component =
      typeof defaultProps.component === 'string'
        ? this.getComponent(defaultProps.component)
        : defaultProps.component;

    let self = this;

    return class extends Component {
      constructor(props) {
        // Deep clone the props and then build any child components in the constructor so we have a
        // copy per component instance.
        let clonedProps = _.cloneDeep(defaultProps);

        clonedProps = self._fillProps(props, clonedProps);

        self._compileChildComponents(clonedProps);

        // Recusively merge child attributes
        super(utils.merge(clonedProps, props));

        // Set name dynamically
        this._className = name;
      }
    };
  }

  _buildComponentIfUncompiled(name, component) {
    // Does the component need to be compiled?
    if (!this.isCompiled(component)) {
      // Build it. This is done so that we can resolve dependencies on demand and so that we don't
      // have to build components that we won't be using. Components are only compiled once and are
      // then cached for reuse.
      return this._buildComponent(name, component);
    } else {
      // Already compiled so return the reference
      return component;
    }
  }

  getComponent(name, props) {
    let component = this._getComponent(name);

    if (props && !this.isCompiled(component)) {
      component = this._fillProps(props, component);
    }

    return this._buildComponentIfUncompiled(name, component);
  }

  // Note: this function is VERY slow so we analyze obj.constructor.name instead
  // isCompiled(obj) {
  //   if (typeof obj === 'object') {
  //     let isCompiled = false;
  //     try {
  //       obj.constructor();
  //     } catch (err) {
  //       isCompiled = true;
  //     }
  //     return isCompiled;
  //   } else {
  //     return true;
  //   }
  // }
  isCompiled(obj) {
    if (typeof obj === 'object') {
      return (
        obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array'
      );
    } else {
      return true;
    }
  }

  _compileChildComponents(props) {
    // Has it already been compiled?
    if (this.isCompiled(props)) {
      return;
    }

    _.each(props, (prop, name) => {
      // Is there something to compile?
      if (prop !== null && !this.isCompiled(prop)) {
        if (prop.component) {
          prop = this._fillProps(props, prop);

          // Compile after filling so that we avoid cloning newly compiled components
          this._compileChildComponents(prop);

          if (typeof prop.component === 'string') {
            props[name] = this._instantiateComponent(prop);
          } else {
            const component = prop.component;
            delete prop.component;
            component.set(prop);
            props[name] = component;
          }
        } else {
          this._compileChildComponents(prop);
        }
      }
    });
  }

  newComponent(props) {
    let clonedProps = _.cloneDeep(props);

    this._compileChildComponents(clonedProps);

    // Need to render?
    if (typeof clonedProps.component === 'string') {
      return this._instantiateComponent(clonedProps);
    } else {
      const component = clonedProps.component;
      delete clonedProps.component;
      component.set(clonedProps);
      return component;
    }
  }

  // TODO: still needed?
  getExtends(name) {
    return this._getUncompiledComponent(name).component;
  }

  instanceOf(componentName, instanceOfName) {
    if (instanceOfName === componentName) {
      return true;
    } else {
      const Component = this._getComponent(componentName);
      if (!this.isCompiled(Component)) {
        // TODO: this doesn't work if the component derives a MSON component as newComponent()
        // deletes the component property. Instead we will probably want to improve this so that we
        // store the complete hierarchy when building the component.
        return this.instanceOf(Component.component, instanceOfName);
      } else {
        const InstanceOfComponent = this._getComponent(instanceOfName);
        const c = new Component();
        return c instanceof InstanceOfComponent;
      }
    }
  }

  getOldestCompiledAncestor(name) {
    const component = this._getComponent(name);
    if (!this.isCompiled(component)) {
      // Ancestor is still a uncompiled component so go again
      return this.getOldestCompiledAncestor(component.component);
    } else {
      return name;
    }
  }

  ensureBuilt(component) {
    if (!this.isCompiled(component)) {
      return this.newComponent(component);
    } else {
      return component;
    }
  }

  registerComponent(name, component) {
    if (this._components[name]) {
      throw new Error(`component ${name} already exists`);
    } else {
      this._components[name] = component;
    }
  }

  deregisterComponent(name) {
    delete this._components[name];
  }
}

const compiler = new Compiler({ components });

// Register compiler so that components have access to the compiler at run-time without causing a
// circular dependency
registrar.compiler = compiler;

export default compiler;
