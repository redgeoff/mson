import events from 'events';
import registrar from '../compiler/registrar';
import utils from '../utils';
import each from 'lodash/each';
import difference from 'lodash/difference';
import cloneDeepWith from 'lodash/cloneDeepWith';

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
export default class BaseComponent extends events.EventEmitter {
  _className = 'Component';

  _getBaseComponentSchema() {
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
          component: 'TextField'
          // required: true
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
          name: 'isStore',
          component: 'BooleanField'
        },
        {
          name: 'props',
          component: 'TextListField'
        },
        {
          name: 'didCreate',
          component: 'BooleanField'
        },
        {
          // True if the component should never be sent to the front end, e.g. if they contain
          // secrets
          name: 'backEndOnly',
          component: 'BooleanField'
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

  _emitCreateIfNotMuted() {
    if (!this.get('muteCreate')) {
      // Execute on next tick so that there is time for any wrapping components to finish the
      // wrapping. This also gives the caller a chance to listen for the create event before it is
      // emitted.
      setTimeout(() => {
        // Emit the create event after we have set up the initial listeners
        this._emitCreate();
      });
    }
  }

  constructor(props) {
    super(props);

    // For mocking
    this._registrar = registrar;

    this._setDebugId();

    this._listenerEvents = {};

    this._isLoaded = false;
    this._resolveAfterCreate = utils.once(this, 'didCreate');

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

    this._emitCreateIfNotMuted();

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
      schema: this._getBaseComponentSchema()
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

  _setParent(parent) {
    this._set('parent', parent);
  }

  _setIsStore(isStore) {
    this._set('isStore', isStore);
  }

  _setDefaults(props, values) {
    each(values, (value, name) => {
      if (props[name] === undefined) {
        this._set(name, value);
      }
    });
  }

  _emitDidCreate() {
    this.set({ didCreate: true });
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

  _setListeners(listeners) {
    // Listeners are concatentated that they can accumulate through the layers of inheritance. TODO:
    // do we need a construct to clear all previous listeners for an event?
    this._concat('listeners', listeners);

    listeners.forEach(listener => {
      const events = Array.isArray(listener.event)
        ? listener.event
        : [listener.event];

      // Register the event so that we can do a quick lookup later
      events.forEach(event => (this._listenerEvents[event] = true));
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
        arguments: args
      });
    }
  }

  _onActionError(err) {
    // Provide a way to intercept errors from detached actions
    this.emitChange('actionErr', err);
  }

  _onDetachedActionError(err) {
    if (this._registrar.log) {
      this._registrar.log.error(err);
    }

    this._onActionError(err);
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

            if (action.get('detached')) {
              // We don't wait for detached actions, but we want to log any errors
              runAction.catch(err => {
                return this._onDetachedActionError(err);
              });
            } else {
              // Pass the previous action's output as this action's arguments
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
        try {
          await this.runListeners(event);
        } catch (err) {
          // Swallow the error and report it via the actionErr event
          this._onActionError(err);
        }
      }
    });
  }

  _pushProp(name) {
    // Is the prop missing? The prop may already exist if we are overloading the type in a dervied
    // component
    if (this._props.indexOf(name) === -1) {
      this._props.push(name);
    }
  }

  _setSchema(schema) {
    // Schemas are pushed so that they can accumulate through the layers of inheritance
    this._push('schema', schema);

    // Push props so that we have a fast way of identifying the props for this component
    if (schema.fields) {
      // Uncompiled?
      schema.fields.forEach(field => this._pushProp(field.name));
    } else if (schema.eachField) {
      schema.eachField(field => {
        if (!schema.isDefaultField(field.get('name'))) {
          this._pushProp(field.get('name'));
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

    if (props.parent !== undefined) {
      this._setParent(props.parent);
    }

    if (props.isStore !== undefined) {
      this._setIsStore(props.isStore);
    }

    if (props.listeners !== undefined) {
      this._setListeners(props.listeners);
    }

    if (props.muteCreate !== undefined) {
      this._setMuteEvents(props.muteCreate);
    }

    this._setIfUndefined(
      Object.assign({}, props, {
        component: undefined,
        name: undefined,
        listeners: undefined,
        schema: undefined,
        isStore: undefined,
        props: undefined
      }),
      ...this._props
    );
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
      'schema',
      'parent',
      'isStore',
      'muteCreate'
    ];

    names = names.concat(this._props);

    return this._getIfAllowed(name, ...names);
  }

  get(names) {
    if (!names) {
      // Get a list of all the property names
      names = this.get('props');
    }

    if (Array.isArray(names)) {
      // Get multiple props
      let values = {};
      names.forEach(name => {
        values[name] = this.getOne(name);
      });
      return values;
    } else {
      // Get single prop
      return this.getOne(names);
    }
  }

  getClassName() {
    // Note: we cannot use Class.prototype.name as this is overwritten by minifiers like UglifyJS.
    //
    // The compiler now uses Object.defineProperty to dynamically set the class name
    // if (this._className) {
    //   // The component was generated via MSON and so the contructor.name is inaccurate
    //   return this._className;
    // } else {
    //   return this.constructor.name;
    // }
    //
    return this._className;
  }

  _cloneDeep(obj) {
    return cloneDeepWith(obj, (item, index, obj, stack) => {
      if (index === '_parent' || index === 'parent') {
        // We don't clone any parent data as this data is circular. This check greatly speeds up
        // cloning as otherwise cloneDeepWith has to auto detect circular references, which can be
        // slow. "_parent" can be present when component.set({ parent }) is called and "parent" can
        // be present in the fillerProps of an action.
        return item;
      }
    });
  }

  _cloneSlow() {
    const clonedComponent = this._cloneDeep(this);

    clonedComponent._setDebugId();

    clonedComponent._setKey();

    // Remove all listeners and expect new ones to be set up so that we don't have duplicate
    // listeners
    clonedComponent.removeAllListeners();

    // We have to manually emitCreate as otherwise the cloned component may not emit didCreate. This
    // can occur when a component is cloned before didCreate is emitted.
    clonedComponent._emitCreateIfNotMuted();

    return clonedComponent;
  }

  _cloneFast({ excludeProps }) {
    // _cloneFast is almost 10 times faster than _cloneSlow. It is far faster to instantiate a new
    // component, deep clone some props and then set the props on the new component.
    const Component = this._registrar.compiler.getCompiledComponent(
      this.getClassName()
    );
    const clonedComponent = new Component();

    let names = this.get('props');
    if (excludeProps) {
      names = difference(names, excludeProps);
    }

    // Note: sing JSON stringify+parse may be slightly faster than cloneDeep, but cloneDeep can
    // handle circular references.
    clonedComponent.set(this._cloneDeep(this.get(names)));

    // The names don't include the parent. The parent should not be deep cloned.
    clonedComponent.set(this.get(['parent']));

    return clonedComponent;
  }

  _clone({ excludeProps } = {}) {
    if (
      this._registrar.compiler &&
      this._registrar.compiler.exists(this.getClassName())
    ) {
      return this._cloneFast({ excludeProps });
    } else {
      return this._cloneSlow();
    }
  }

  clone() {
    return this._clone();
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
    schemas.forEach(schema => {
      // console.log('schemas', JSON.stringify(schema));
      if (!compiler.isCompiled(schema)) {
        schema = compiler.newComponent(schema);
      }
      form.copyFields(schema);
    });
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

  resolveAfterCreate() {
    return this._resolveAfterCreate;
  }
}
