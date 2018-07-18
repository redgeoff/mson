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

  _getComponent(name) {
    if (this._components[name]) {
      return this._components[name];
    } else if (this._validateOnly) {
      // We return a Form as for now all dynamic components are forms. In the future, we may need to
      // use the associated schema to determine the base component for instantiation.
      return this._components.Form;
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

  // Note: preserve a reminder of slower older implementation
  // _removeComponentDefinitions(props) {
  //   if (typeof props === 'object' && props !== null) {
  //     if (props.component) {
  //       delete props.component;
  //     }
  //     _.each(props, (prop, name) => {
  //       this._removeComponentDefinitions(prop);
  //     });
  //   }
  // }

  _fillProps(props, component, inPlace) {
    const propFiller = new PropFiller(props);

    // We don't need to clone as fillAll does this for us
    component = propFiller.fillAll(component, inPlace);

    // Capture props and set passed so that actions ifData is automatically injected for actions.
    //
    // Note: the following commented out implementation below is VERY slow. Instead, we make sure to
    // ignore the passed prop when compiling to prevent infinite recursion. In addition, fillAll()
    // has also been enhanced to handle circular references.
    //
    // var clonedProps = _.cloneDeep(props);
    // this._removeComponentDefinitions(clonedProps);
    // component.passed = clonedProps;
    component.passed = props;

    return component;
  }

  _instantiateComponent(props) {
    const Component = this.getComponent(props.component, props);

    // TODO: maybe 'component' should be renamed to something like 'compiledComponent' so that we
    // still have a reference to original hierarchy. Alternatively, maybe we can track this
    // hierarchy via something like a prototype chain in the actual JS object.
    delete props.component;

    if (this._validateOnly) {
      // We need to mute the events or else there may be listeners that will try to act on a dynamic
      // component that will never be supplied.
      props = Object.assign({}, props, { muteCreate: true });
    }

    return new Component(props);
  }

  _cloneDeep(props) {
    // We optimize cloneDeep by ignoring any parent attribute as this data does not need to be
    // cloned and it is computationally expensive to detect circular references in this data.
    return _.cloneDeepWith(props, (item, index) => {
      if (index === '_parent') {
        return null;
      }
    });
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
        let clonedProps = self._cloneDeep(defaultProps);

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
      // Is there something to compile? We need to ignore the passed prop to prevent infinite
      // recursion. See _fillProps() for more info.
      if (prop !== null && !this.isCompiled(prop) && name !== 'passed') {
        if (prop.component) {
          // TODO: why is it faster here if _fillProps clones the data? (At least when toggling
          // archived status for FormsField list)
          prop = this._fillProps(props, prop, false);

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
    let clonedProps = this._cloneDeep(props);

    // TODO: refactor so that _compileChildComponents works with cloneDeepWith so that we only
    // iterate through the object once
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
