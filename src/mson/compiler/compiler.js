// TODO:
//  - Is automatically building from MSON really the best or should it be done in a lazy way so
//    that we don't have to render pieces that are not yet in use?
//  - Would it be advantageous to allow for copying of sub components, e.g. fields, instead of
//    using inheritance so that can mix in parts of different components. This would be like a
//    React design pattern. Or, would this make things too complex?

// Notes:
//  - An older design did a one-time build of MSON components and then stored them in
//    _builtComponents, unfortunately, this optimization had to be removed as MSON components can
//    now have dynamic attributes. TODO: as a future optimization we can check to see if a MSON
//    component has dynamic attributes and if it doesn't then we can cache the built component.

import components from '../components';
import _ from 'lodash';
import utils from '../utils';
import PropFiller from './prop-filler';
import registrar from './registrar';

export class Compiler {
  constructor(props) {
    this._components = props.components;
  }

  // // We keep this separate from components so that we have a way of referencing MSON components
  // // after the components have been built. Moreover, this construct doesn't require any special
  // // organization in the components object.
  // _builtComponents = {};

  isMSONComponent(component) {
    return typeof component === 'object';
  }

  _getComponent(name) {
    if (this._components[name]) {
      return this._components[name];
    } else {
      throw new Error('missing component ' + name);
    }
  }

  _getMSONComponent(name) {
    const component = this._getComponent(name);
    if (this.isMSONComponent(component)) {
      return component;
    } else {
      throw new Error('missing MSON component ' + name);
    }
  }

  // _buildComponent(name, component) {
  //   // Is the component MSON?
  //   if (this.isMSONComponent(component)) {
  //     // Build it. This is done so that we can resolve dependencies on demand and so that we don't
  //     // have to build components that we won't be using. Components are only built once and are
  //     // then cached for reuse.
  //     component = this.buildComponent(name, component);
  //     this._builtComponents[name] = component;
  //   } else {
  //     // Already built so just copy the reference
  //     this._builtComponents[name] = component;
  //   }
  // }

  // getComponent(name) {
  //   if (!this._builtComponents[name]) {
  //     const component = this._getComponent(name);
  //     this._buildComponent(name, component);
  //   }
  //
  //   return this._builtComponents[name];
  // }

  _buildComponent(name, component) {
    // Is the component MSON?
    if (this.isMSONComponent(component)) {
      // Build it. This is done so that we can resolve dependencies on demand and so that we don't
      // have to build components that we won't be using. Components are only built once and are
      // then cached for reuse.
      return this.buildComponent(name, component);
    } else {
      // Already built so return the reference
      return component;
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

  getComponent(name, props) {
    // // TODO: enhance properly?
    // if (typeof name !== 'string') {
    //   return name;
    // }
    let component = this._getComponent(name);

    if (props && this.isMSONComponent(component)) {
      component = this._fillProps(props, component);
    }

    return this._buildComponent(name, component);
  }

  buildComponent(name, defaultProps) {
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
        delete clonedProps.component;

        clonedProps = self._fillProps(props, clonedProps);

        self._buildChildComponents(clonedProps);

        // Recusively merge child attributes
        super(utils.merge(clonedProps, props));

        // Set name dynamically
        this._className = name;
      }
    };
  }

  _buildChildComponents(props) {
    // Build any child components
    _.each(props, (prop, name) => {
      // Is this component unbuilt?
      if (prop && prop.component) {
        prop = this._fillProps(props, prop);

        props[name] = this.newComponent(prop);
      } else if (Array.isArray(prop) || typeof prop === 'object') {
        this._buildChildComponents(prop);
      }
    });
  }

  newComponent(props) {
    let clonedProps = _.cloneDeep(props);

    // TODO: maybe 'component' should be renamed to something like 'builtComponent' so that we still
    // have a reference to original hierarchy. Alternatively, maybe we can track this hierarchy via
    // something like a prototype chain in the actual JS object.
    delete clonedProps.component;

    this._buildChildComponents(clonedProps);

    // Need to render?
    if (typeof props.component === 'string') {
      const Component = this.getComponent(props.component, props);
      return new Component(clonedProps);
    } else {
      props.component.set(clonedProps);
      return props.component;
    }
  }

  // TODO: still needed?
  getExtends(name) {
    return this._getMSONComponent(name).component;
  }

  instanceOf(componentName, instanceOfName) {
    if (instanceOfName === componentName) {
      return true;
    } else {
      const Component = this._getComponent(componentName);
      if (this.isMSONComponent(Component)) {
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

  getOldestNonMSONAncestor(name) {
    const component = this._getComponent(name);
    if (this.isMSONComponent(component)) {
      // Ancestor is still a MSON component so go again
      return this.getOldestNonMSONAncestor(component.component);
    } else {
      return name;
    }
  }

  ensureBuilt(component) {
    if (this.isMSONComponent(component)) {
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
