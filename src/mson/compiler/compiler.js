// Notes:
//  - An older design did a one-time build of MSON components and then stored them in
//    _compiledComponents, unfortunately, this optimization had to be removed as MSON components can
//    now have dynamic attributes. TODO: as a future optimization we can check to see if a MSON
//    component has dynamic attributes and if it doesn't then we can cache the compiled component.
//    But, is this caching even worth it? The downside to the caching is that we could end up
//    storing more in memory.

import components from '../components';
import _ from 'lodash';
import PropFiller from './prop-filler';
import registrar from './registrar';

export class Compiler {
  constructor(props) {
    this._components = props.components;
    this._validateOnly = false;
  }

  setValidateOnly(validateOnly) {
    // The validateOnly mode allows us to validate a definition that contains dynamic components
    // without requiring these dynamic components to be instantiated. It essentially disables the
    // listeners and then just uses the schemas to validate the definition.
    this._validateOnly = validateOnly;
  }

  // // We keep this separate from components so that we have a way of referencing uncompiled
  // // components after the components have been compiled. Moreover, this construct doesn't require
  // // any special organization in the components object.
  // _compiledComponents = {};

  exists(name) {
    return !!this._components[name];
  }

  getComponent(name) {
    if (this.exists(name)) {
      return this._components[name];
    } else {
      throw new Error('missing component ' + name);
    }
  }

  _getWrappedComponentClass(name, defaultProps, parentProps) {
    const Component = this.getCompiledComponent(name, defaultProps);

    const self = this;

    // Create a class that sets the props by default
    class MyComponent extends Component {
      _create(props) {
        // Use the parentProps and props to fill
        const propFiller = new PropFiller(
          Object.assign({}, parentProps, props)
        );

        // Clone the data as we will be instantiating pieces of it below and we want each instance
        // of MyComponent to have its own copy
        const inPlace = false;
        defaultProps = propFiller.fillAll(defaultProps, inPlace);

        // Remove the component property as it is no longer needed
        delete defaultProps.component;

        // Instantiate defaultProps. We do this in _create() so that we have a fresh instance of all
        // the child components
        self._instantiate(defaultProps);

        // props may also contain items that need to be instantiated
        self._instantiate(props);

        // The default props and props need to be passed to _create() so that parent has a chance to
        // act on these props.
        const propsAndDefaultProps = Object.assign({}, defaultProps, props);
        super._create(propsAndDefaultProps);

        // Are we wrapping a component? Clear the componentToWrap
        if (defaultProps.componentToWrap) {
          delete defaultProps.componentToWrap;
        }

        this.set(defaultProps);
      }
    }

    // If the name is a class then we use the inherited name
    Object.defineProperty(MyComponent, 'name', {
      value: name,
      writable: false
    });

    return MyComponent;
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

  getCompiledComponent(name, parentProps) {
    // TODO: use a cache to store compiled components so only have to compile once? Does this really
    // reduce overall latency? The downside is that more will be stored in the components object,
    // although not much more as it is just a wrapper.
    let Component = this.getComponent(name);

    if (this.isCompiled(Component)) {
      return Component;
    } else {
      return this.compile(Component, parentProps);
    }
  }

  // The parentProps define values for the template parameters in props and allow us to make pieces
  // of our components dynamic.
  compile(props, parentProps) {
    return this._getWrappedComponentClass(props.component, props, parentProps);
  }

  _instantiateComponent(Component, props) {
    if (this._validateOnly) {
      // We need to mute the events or else there may be listeners that will try to act on a dynamic
      // component that will never be supplied.
      props = Object.assign({}, props, { muteCreate: true });
    }

    return new Component(props);
  }

  _instantiate(props) {
    // Already instantiated? This can occur with wrapped components.
    if (props instanceof components.Component) {
      return props;
    }

    // Descend all the way down the tree and then start instantiating on the way up
    _.each(props, (prop, name) => {
      if (typeof prop === 'object' && prop !== null) {
        props[name] = this._instantiate(prop);
      }
    });

    // Does the object need to be instantiated?
    if (props.component) {
      const Component = this.getCompiledComponent(props.component);
      return this._instantiateComponent(
        Component,
        Object.assign({}, props, { component: undefined })
      );
    } else {
      return props;
    }
  }

  newComponent(props) {
    const Component = this.compile(props);
    return this._instantiateComponent(Component);
  }

  getOldestCompiledAncestor(name) {
    const component = this.getComponent(name);
    if (!this.isCompiled(component)) {
      // Ancestor is still an uncompiled component so go again
      return this.getOldestCompiledAncestor(component.component);
    } else {
      return name;
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

  validateDefinition(definition) {
    const component = this.newComponent({
      component: definition.component
    });

    const Form = this._components.Form;
    const schemaForm = new Form();
    component.buildSchemaForm(schemaForm, this);

    // Set the schema so that props can be set at the same layer as the schema
    if (definition.schema) {
      const topSchema = compiler.newComponent(definition.schema);

      // Not required as these values are defaults at the same layer as the schema
      topSchema.setRequired(false);

      schemaForm.copyFields(topSchema);
    }

    schemaForm.setValues(definition);
    schemaForm.validate();

    return schemaForm;
  }
}

const compiler = new Compiler({ components });

// Register compiler so that components have access to the compiler at run-time without causing a
// circular dependency
registrar.compiler = compiler;

export default compiler;
