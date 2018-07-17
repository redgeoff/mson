import events from 'events';
import _ from 'lodash';
import registrar from '../compiler/registrar';

let nextKey = 0;
const getNextKey = () => {
  return nextKey++;
};

// NOTE:
// - Get and set designed so that easy to add functionality later on set and get, including via
//   event listeners
// - The props are placed directly on this object as opposed to onto say a "_props" field. This has
//   the advantage of making it less verbose to access, e.g. comp._foo instead of comp._props.foo.
// - We attempted to require all access to all props via get() and set(), but this can cause
//   infinite recursion, e.g. when a get() calls itself either directly or via some inherited logic.
export default class Component extends events.EventEmitter {
  _getComponentMSONSchema() {
    return {
      component: 'Form',
      fields: [
        {
          // This field is just for the MSON definition
          name: 'component',
          component: 'TextField'
          // required: true
        },
        {
          name: 'name',
          component: 'TextField',
          required: true
        },
        {
          name: 'listeners',
          // TODO: proper schema
          component: 'Field'
        },
        {
          name: 'schema',
          component: 'FormField',
          form: {
            // TODO: should there be a SchemaForm?
            component: 'ObjectForm'
          }
        },
        {
          name: 'store',
          component: 'BooleanField'
        },
        {
          name: 'props',
          component: 'TextListField'
        }
      ]
    };
  }

  _emitCreate() {
    this._emitChange('create');

    if (!this._hasListenerForEvent('create')) {
      // There are no create listeners so emit a created event
      this._emitDidCreate();
    }
  }

  _setDebugId() {
    // Used to identify instances when debugging
    this._debugId = Math.random();
  }

  constructor(props) {
    super(props);

    this._setDebugId();

    this._listenerEvents = {};

    this._listenToAllChanges();

    this._props = [];

    // We have to set the name before we create the component as the name is needed to create the
    // component, e.g. to create sub fields using the name as a prefix.
    if (props && props.name !== undefined) {
      // Use setProperty so we don'trigger any events before creation
      this._setProperty('name', props.name);
    }

    if (props && props.muteCreate !== undefined) {
      // Use setProperty so we don'trigger the create event
      this._setProperty('muteCreate', props.muteCreate);
    }

    this._create(props === undefined ? {} : props);
    this.set(props === undefined ? {} : props);

    if (!this.get('muteCreate')) {
      // Emit the create event after we have set up the initial listeners
      this._emitCreate();
    }

    this._setKey();
  }

  _setKey() {
    // Used to create a separate namespace/keyspace for components so that we can do things like
    // trigger a UI update in frameworks like React.
    this._key = getNextKey();
  }

  _create(/* props */) {
    // TODO: would it be better if the schema was loaded dynamically and on demand instead of
    // whenever the component is created? In some ways we already have this the schema exists as
    // simple objects until it instantiated. The problem with a lazy setting of the schema is how we
    // would allow schemas to be defined via MSON.
    this.set({
      schema: this._getComponentMSONSchema()
    });
  }

  // TODO: refactor out and use emitChange instead
  _emitChange(name, value) {
    this.emit(name, value);
    this.emit('$change', name, value);
  }

  emitChange(name, value) {
    this._emitChange(name, value);
  }

  _setProperty(name, value) {
    this['_' + name] = value;
  }

  _setPropertyAndEmitChange(name, value) {
    this._setProperty(name, value);
    this._emitChange(name, value);
  }

  _set(name, value) {
    // Is the value changing? Prevent emitting when the value doesn't change. Note: a previous
    // design treated undefined and null values as equals, but this had to be changed as otherwise
    // we have no construct for detecting when properties are omitted from a MSON definition.
    if (this['_' + name] !== value) {
      this._setPropertyAndEmitChange(name, value);
    }
  }

  _push(name, value) {
    let values = this._get(name);
    if (!Array.isArray(values)) {
      values = [];
    }
    values.push(value);
    this._set(name, values);
  }

  _concat(name, newValues) {
    let values = this._get(name);
    if (!Array.isArray(values)) {
      values = [];
    }
    values = values.concat(newValues);
    this._set(name, values);
  }

  _setIfUndefinedProp(props, name) {
    if (props[name] !== undefined) {
      this._set(name, props[name]);
    }
  }

  _setIfUndefined(props, ...names) {
    names.forEach(name => {
      this._setIfUndefinedProp(props, name);
    });
  }

  _setName(name) {
    this._set('name', name);
  }

  _setPassed(passed) {
    this._set('passed', passed);
  }

  _setParent(parent) {
    this._set('parent', parent);
  }

  _setStore(store) {
    this._set('store', store);
  }

  _setDefaults(props, values) {
    _.each(values, (value, name) => {
      if (props[name] === undefined) {
        this._set(name, value);
      }
    });
  }

  _emitDidCreate() {
    this._emitChange('didCreate');
  }

  _emitDidLoad() {
    this._emitChange('didLoad');
    this._isLoaded = true;
  }

  // Note: the layer attribute cannot reside in Globals as Globals depends on component
  static _layer = null;

  static getLayer() {
    return this.constructor._layer;
  }

  static setLayer(layer) {
    this.constructor._layer = layer;
  }

  // For mocking
  _getLayer() {
    return this.constructor.getLayer();
  }

  _hasListenerForEvent(event) {
    return !!this._listenerEvents[event];
  }

  _setListeners(listeners, passed) {
    // Listeners are concatentated that they can accumulate through the layers of inheritance. TODO:
    // do we need a construct to clear all previous listeners for an event?
    this._concat('listeners', listeners);

    listeners.forEach(listener => {
      const events = Array.isArray(listener.event)
        ? listener.event
        : [listener.event];

      // Register the event so that we can do a quick lookup later
      events.forEach(event => (this._listenerEvents[event] = true));

      // Inject ifData so that we don't have to explicitly define it in the actions
      listener.ifData = passed;
    });
  }

  _emitAfterListenerEvents(event) {
    // Emit event after all actions for the following events so that we can guarantee that data has
    // been loaded.
    switch (event) {
      case 'create':
        this._emitDidCreate();
        break;
      case 'load':
        this._emitDidLoad();
        break;
      default:
        break;
    }
  }

  async _runAction(listener, action, event, args) {
    const layer = action.get('layer');
    if (!this._getLayer() || !layer || layer === this._getLayer()) {
      return action.run({
        event,
        component: this,
        ifData: listener.ifData,
        arguments: args
      });
    }
  }

  _onDetachedActionError(err) {
    if (registrar.log) {
      registrar.log.error(err);

      // Provide a way to intercept errors from detached actions
      this.emitChange('actionError', err);
    }
  }

  async runListeners(event) {
    const listeners = this.get('listeners');
    if (listeners) {
      for (let i in listeners) {
        const listener = listeners[i];

        const events = Array.isArray(listener.event)
          ? listener.event
          : [listener.event];

        // Listener is for this event?
        if (events.indexOf(event) !== -1) {
          let output = null;
          for (const i in listener.actions) {
            const action = listener.actions[i];

            const runAction = this._runAction(listener, action, event, output);

            if (action.get('detach')) {
              // We don't wait for detached actions, but we want to log any errors
              runAction.catch(err => {
                return this._onDetachedActionError(err);
              });
            } else {
              // Pass the previous action's output as this actions arguments
              output = await runAction;
            }
          }
        }
      }

      this._emitAfterListenerEvents(event);
    }
  }

  _listenToAllChanges() {
    this.on('$change', async (event, value) => {
      if (this._listenerEvents[event]) {
        await this.runListeners(event);
      }
    });
  }

  _setSchema(schema) {
    // Schemas are pushed that they can accumulate through the layers of inheritance
    this._push('schema', schema);

    // Push props so that we have a fast way of identifying the props for this component
    if (schema.fields) {
      // Uncompiled?
      schema.fields.forEach(field => {
        // Is the prop missing? The prop may already exist if we overloading the type in a dervied
        // component
        if (this._props.indexOf(field.name) === -1) {
          this._props.push(field.name);
        }
      });
    } else if (schema.eachField) {
      schema.eachField(field => {
        if (!schema.isDefaultField(field.get('name'))) {
          // Is the prop missing? The prop may already exist if we overloading the type in a dervied
          // component
          if (this._props.indexOf(field.get('name')) === -1) {
            this._props.push(field.get('name'));
          }
        }
      });
    }
  }

  _setMuteEvents(muteCreate) {
    this._set('muteCreate', muteCreate);
  }

  set(props) {
    if (typeof props !== 'object') {
      throw new Error('props must be an object');
    }

    if (props.schema !== undefined) {
      this._setSchema(props.schema);
    }

    if (props.name !== undefined) {
      this._setName(props.name);
    }

    if (props.passed !== undefined) {
      this._setPassed(props.passed);
    }

    if (props.parent !== undefined) {
      this._setParent(props.parent);
    }

    if (props.store !== undefined) {
      this._setStore(props.store);
    }

    if (props.listeners !== undefined) {
      this._setListeners(props.listeners, props.passed);
    }

    if (props.muteCreate !== undefined) {
      this._setMuteEvents(props.muteCreate);
    }

    if (this._props) {
      this._setIfUndefined(
        Object.assign({}, props, {
          component: undefined,
          name: undefined,
          listeners: undefined,
          schema: undefined,
          store: undefined,
          props: undefined,
          passed: undefined
        }),
        ...this._props
      );
    }
  }

  _get(name) {
    return this['_' + name];
  }

  _getIfAllowed(name, ...allowedNames) {
    if (allowedNames.indexOf(name) !== -1) {
      return this._get(name);
    }
  }

  getOne(name) {
    let names = [
      'name',
      'listeners',
      'passed',
      'schema',
      'parent',
      'store',
      'muteCreate'
    ];

    if (this._props) {
      names = names.concat(this._props);
    }

    return this._getIfAllowed(name, ...names);
  }

  get(names) {
    if (!names) {
      // Get all props
      let values = {};
      _.each(this, (value, name) => {
        const n = name.replace('_', '');
        values[n] = this.getOne(n);
      });
      return values;
    } else if (Array.isArray(names)) {
      // Get multiple props
      let values = {};
      names.forEach(name => {
        values[name] = this.getOne(name);
      });
      return values;
    } else if (names) {
      // Get single prop
      return this.getOne(names);
    }
  }

  getClassName() {
    if (this._className) {
      // The component was generated via MSON and so the contructor.name is inaccurate
      return this._className;
    } else {
      return this.constructor.name;
    }
  }

  clone() {
    const clonedComponent = _.cloneDeep(this);

    clonedComponent._setDebugId();

    clonedComponent._setKey();

    // Remove all listeners and expect new ones to be set up so that we don't have duplicate
    // listeners
    clonedComponent.removeAllListeners();

    return clonedComponent;
  }

  // This should be called whenever the route changes and the component is loaded
  emitLoad() {
    this._emitChange('load');

    if (!this._hasListenerForEvent('load')) {
      // There are no load listeners so emit a loaded event
      this._emitDidLoad();
    }
  }

  // This should be called whenever the route changes and the component is unloaded
  emitUnload() {
    // Flag needs to be set before unload event is emitted or else listeners may not read
    // isLoaded=false
    this._isLoaded = false;

    this._emitChange('unload');
  }

  _bubbleUpEvents(component, events) {
    events.forEach(event => {
      component.on(event, value => {
        this._emitChange(event, value);
      });
    });
  }

  getKey() {
    return this._key;
  }

  // Set properties on another component. Useful for nested components
  _setOn(component, props, propNames) {
    propNames.forEach(name => {
      if (props[name] !== undefined) {
        component.set({ [name]: props[name] });
      }
    });
  }

  // Get properties from another component. Useful for nested components
  _getFrom(component, name, propNames) {
    if (propNames.indexOf(name) !== -1) {
      return component.get(name);
    }
  }

  buildSchemaForm(form, compiler) {
    const schemas = this.get('schema');
    if (schemas) {
      schemas.forEach(schema => {
        if (!compiler.isCompiled(schema)) {
          schema = compiler.newComponent(schema);
        }
        form.copyFields(schema);
      });
    }
  }

  static getNextKey() {
    return getNextKey();
  }

  static toUniqueId(key) {
    return 'mson-' + key;
  }

  static getNextUniqueId() {
    const key = this.getNextKey();
    return this.toUniqueId(key);
  }

  getUniqueId() {
    return this.constructor.toUniqueId(this._key);
  }

  isLoaded() {
    return this._isLoaded;
  }
}
