import Field from './field';
import globals from '../globals';
import Mapa from '../mapa';
import InfiniteLoader from '../infinite-loader';
import Component from '../component';
import utils from '../utils';

// Note: We no longer instantiate a default store for the CollectionField as having a store
// introduces extra complexity that is not always needed. For example, when using the
// CollectionField without a store, you can use set() and get() to modify the underlying data
// synchronously, which is useful for small datasets, e.g. nested form data. When using a store;
// however, you have to account for the store being asynchronous, and therefore all manipulation of
// the data should go through the store.
export default class CollectionField extends Field {
  _className = 'CollectionField';

  static SCROLLTHRESHOLD_DEFAULT = 2000;

  // We want this to be a multiple of 4 as we may make it optional to have 4 columns in
  // CollectionField
  static ITEMS_PER_PAGE_DEFAULT = 20;

  static MAX_BUFFER_PAGES_DEFAULT = 3;

  _create(props) {
    super._create(props);

    const c = this.constructor;

    // For mocking
    this._window = global.window;
    this._document = global.document;
    this._globals = globals;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'formFactory',
            component: 'Field'
          },
          {
            // Note: this prop is automatically generated using the formFactory and can be read, but
            // should not be be set
            name: 'form',
            component: 'Field'
          },
          {
            name: 'forbidCreate',
            component: 'BooleanField'
          },
          {
            name: 'forbidUpdate',
            component: 'BooleanField'
          },
          {
            name: 'forbidDelete',
            component: 'BooleanField'
          },
          {
            name: 'forbidViewArchived',
            component: 'BooleanField'
          },
          {
            name: 'forbidSearch',
            component: 'BooleanField'
          },
          {
            name: 'forbidSort',
            component: 'BooleanField'
          },
          {
            name: 'minSize',
            component: 'IntegerField'
          },
          {
            name: 'maxSize',
            component: 'IntegerField'
          },
          {
            name: 'singularLabel',
            component: 'TextField'
          },
          {
            name: 'store',
            component: 'Field'
          },
          {
            name: 'scrollThreshold',
            component: 'IntegerField'
          },
          {
            name: 'itemsPerPage',
            component: 'IntegerField'
          },
          {
            name: 'maxBufferPages',
            component: 'IntegerField'
          },
          {
            name: 'spacerHeight',
            component: 'IntegerField'
          },
          {
            name: 'spacerId',
            component: 'TextField'
          },
          {
            name: 'bufferTopId',
            component: 'TextField'
          },
          {
            name: 'isLoading',
            component: 'BooleanField'
          },
          {
            name: 'order',
            component: 'Field'
          },
          {
            name: 'currentForm',
            component: 'Field'
          },
          {
            name: 'mode',
            component: 'TextField'
          },
          {
            name: 'noResults',
            component: 'BooleanField'
          },
          {
            name: 'pristine',
            component: 'BooleanField'
          },
          {
            name: 'change',
            component: 'Field'
          }
        ]
      }
    });

    this._setDefaults(props, {
      scrollThreshold: c.SCROLLTHRESHOLD_DEFAULT,
      itemsPerPage: c.ITEMS_PER_PAGE_DEFAULT,
      maxBufferPages: c.MAX_BUFFER_PAGES_DEFAULT,
      spacerHeight: 0,
      spacerId: Component.getNextUniqueId(),

      // Needed so that unload does not trigger listeners as these props would otherwise be
      // initialized as undefined
      order: null,
      mode: null,
      showArchived: false,
      searchString: null
    });

    this._createInfiniteLoader();

    // We use a Mapa instead of an array as it allows us to index the forms by id. We use a Mapa
    // instead of a Map as we may want to iterate through the forms beginning at any single form.
    this._forms = new Mapa();

    this._listenForLoaded();
    this._listenForUnload();
    this._listenForShowArchived();
    this._listenForSearchString();
    this._listenForOrder();
    this._listenForScroll();
  }

  _listenForLoaded() {
    this.on('didLoad', async () => {
      // Wait for loaded event so that we have had a chance to load options, etc...

      if (this.get('formFactory')) {
        // Regenerate the form so that we have one that has any loaded data
        this._generateForm(this.get('formFactory'));

        // Emit load so that form can complete any listeners, e.g. taking snapshot
        const form = this.get('form');
        form.emitLoad();
      }

      this._resetInfiniteLoader();

      this._updateInfiniteLoader();

      await this._infiniteLoader.getAll();
    });
  }

  _onUnload() {
    // Clear order, mode and showArchived so that we are ready for when we return
    this.set({
      order: null,
      mode: null,
      showArchived: false,
      searchString: null
    });

    if (this.get('formFactory')) {
      const form = this.get('form');
      form.emitUnload();
    }
  }

  _listenForUnload() {
    this.on('unload', () => {
      this._onUnload();
    });
  }

  _resetInfiniteLoader() {
    this._infiniteLoader.reset();
  }

  _updateInfiniteLoader() {
    this._infiniteLoader.setShowArchived(this.get('showArchived'));
    this._infiniteLoader.setWhere(this._where);
    this._infiniteLoader.setOrder(this.get('order'));
  }

  _handleStoreChangeFactory() {
    return async (name, value) => {
      const muteChange = false;
      const vv = value && value.value;
      switch (name) {
        case 'createDoc':
        case 'updateDoc':
          // Does the form exist and the archivedAt is changing?
          if (
            this._forms.has(vv.id) &&
            vv.archivedAt !== this._forms.get(vv.id).getValue('archivedAt')
          ) {
            return this.removeForm(vv.id, muteChange);
          } else if (!!vv.archivedAt === this.get('showArchived')) {
            // The archivedAt matches the current showArchived
            return this.upsertForm({
              values: {
                ...vv.fieldValues,
                id: vv.id,
                archivedAt: vv.archivedAt,
                userId: vv.userId
              },
              muteChange,
              cursor: vv.cursor
              // beforeKey: value.prevKey
            });
          }
          break;

        case 'deleteDoc':
          return this.removeFormIfExists(vv.id, muteChange);

        default:
          // Do nothing
          break;
      }
    };
  }

  _setStore(newStore) {
    const store = this.get('store');
    if (newStore !== store) {
      if (store) {
        store.removeAllListeners();
      }

      // newStore can be falsy if the store is being cleared. TODO: is there a better way than doing
      // the typeof check to ensure that an empty RecordList doesn't bomb out when
      // newStore='{{store}}'?
      if (newStore && typeof newStore !== 'string') {
        newStore.on('$change', this._handleStoreChangeFactory());
      }

      this._set('store', newStore);
    }
  }

  async _clearAndGetAll() {
    // Clear any existing forms. TODO: it would be more efficient to just record ids of all
    // existing items and then use getAll() result to determine if item needs to be inserted or
    // removed (if current id missing)
    this._forms.clear();

    this._resetInfiniteLoader();

    this._updateInfiniteLoader();

    await this._infiniteLoader.getAll();
  }

  _handleShowArchivedFactory() {
    return async showArchived => {
      this.set({ showArchived });

      await this._clearAndGetAll();
    };
  }

  _listenForShowArchived() {
    this.on('showArchived', this._handleShowArchivedFactory());
  }

  _toWhereFromSearchString() {
    if (this.get('searchString')) {
      const form = this.get('form');
      const fieldNames = [];
      form.eachField(field => {
        // TODO: is it really best to filter by hidden? Better to filter by default? Or, by hidden is
        // good and expect user to specify fields if different?
        if (!field.get('hidden') && !form.isDefaultField(field.get('name'))) {
          fieldNames.push('fieldValues.' + field.get('name'));
        }
      });
      return utils.toWhereFromSearchString(
        fieldNames,
        this.get('searchString')
      );
    } else {
      return null;
    }
  }

  _handleSearchStringFactory() {
    return async searchString => {
      this.set({ searchString });

      this._where = this._toWhereFromSearchString();

      // Is the component still loaded? We want to prevent issuing a new query when the searchString
      // is cleared when we change our route.
      if (this.isLoaded()) {
        await this._clearAndGetAll();
      }
    };
  }

  _listenForSearchString() {
    this.on('searchString', this._handleSearchStringFactory());
  }

  _handleOrderFactory() {
    return async order => {
      this.set({ order });

      // Is the component still loaded? We want to prevent issuing a new query when the order
      // is cleared when we change our route.
      if (this.isLoaded()) {
        await this._clearAndGetAll();
      }
    };
  }

  // TODO: would it be better to intercept set({ order }), etc... instead of using listeners?
  _listenForOrder() {
    this.on('order', this._handleOrderFactory());
  }

  _handleScrollFactory() {
    return () => {
      this._infiniteLoader.scroll({ scrollY: this._window.scrollY });
    };
  }

  _listenForScroll() {
    this.on('scroll', this._handleScrollFactory());
  }

  _onRemoveItems(id, n, reverse) {
    let i = 0;
    let lastId = null;
    for (const entry of this._forms.entries(id, reverse)) {
      lastId = entry[0];
      if (i++ === n) {
        break;
      }

      // We want to mute the changes or else we'll introduce a lot of latency on the UI thread.
      const muteChange = true;
      this.removeForm(lastId, muteChange);
    }
    return lastId;
  }

  _onResizeSpacer(dHeight, height) {
    let newHeight = null;

    // Was an absolute height specified?
    if (height !== undefined) {
      newHeight = height;
    } else {
      // Change by a delta
      newHeight = this.get('spacerHeight') + dHeight;
    }

    // this._infiniteLoader may not exist yet
    const beginning = this._infiniteLoader
      ? this._infiniteLoader.beginningLoaded()
      : false;

    let surplus = 0;

    if (beginning && dHeight < 0) {
      // When expanding the screen and then scrolling up, the spacer may be lager than the space
      // needed. This is fine until we reach the top at which point we need to set the height of the
      // spacer to 0 and then scroll to account for the offset.
      surplus = -newHeight;
      newHeight = 0;
    } else if (newHeight < 0) {
      // The spacer has a negative height, probably because the screen size has changed
      surplus = -newHeight;
      newHeight = 0;
    }

    this.set({ spacerHeight: newHeight });

    // The spacer has no more space (probably because the screen shrinked) so we need to scroll
    // to make sure that the user stays at the same point in the list when the new items are
    // added at the top.
    if (surplus !== 0) {
      this._window.scrollBy({
        top: surplus,
        behavior: 'instant'
      });
    }
  }

  async _onGetAll(props) {
    const store = this.get('store');
    if (store) {
      const records = await store.getAllDocs(props);

      // Did we get back an empty set of results and we are on the first page?
      const noResults =
        records.edges.length === 0 && !props.after && !props.before;

      this.set({ noResults });
      return records;
    }
  }

  _createInfiniteLoader() {
    this._infiniteLoader = new InfiniteLoader({
      onGetAll: props => this._onGetAll(props),
      onGetItemsPerPage: () => this.get('itemsPerPage'),
      onGetScrollThreshold: () => this.get('scrollThreshold'),
      onGetMaxBufferPages: () => this.get('maxBufferPages'),
      onGetItemElement: id =>
        this._document.getElementById(this.getUniqueItemId(id)),
      onGetSpacerElement: () =>
        this._document.getElementById(this.get('spacerId')),
      onRemoveItems: (id, n, reverse) => this._onRemoveItems(id, n, reverse),
      onGetItems: (id, reverse) => this._forms.values(id, reverse),
      onResizeSpacer: (dHeight, height) =>
        this._onResizeSpacer(dHeight, height),
      onSetBufferTopId: bufferTopId => this.set({ bufferTopId }),
      onGetItem: id => this._forms.get(id),
      onGetItemId: form => form.getValue('id'),
      onGetItemCursor: form => form.get('cursor'),
      onAddItems: (edges, beforeKey) => this._onAddItems(edges, beforeKey),
      onEmitChange: records => this.set({ change: records }),
      onSetIsLoading: isLoading => this.set({ isLoading })
    });
  }

  _listenToForm(form) {
    const props = ['dirty', 'touched'];
    props.forEach(prop => {
      form.on(prop, value => {
        if (value === true) {
          // We only set the parent value when it is true as want to avoid infinite recursion
          this.set({ [prop]: value });
        }
      });
    });
  }

  _addForm({ form, values, muteChange, cursor, beforeKey }) {
    form.setValues(values);

    form.set({ parent: this, cursor });

    const id = form.getField('id');
    let key = 0;
    if (id.isBlank()) {
      // The id value is blank so use the current _forms length as the key
      key = this._forms.length();
    } else {
      key = id.getValue();
    }

    // Set noResults to false as we now have results
    this.set({ noResults: false });

    // Add form to mapa
    this._forms.set(key, form, beforeKey);

    this._listenToForm(form);

    if (!muteChange) {
      // Emit change so that UI is notified
      this.set({ change: values });
    }

    return form;
  }

  async _produceFormAndWaitForLoad() {
    const form = this.produce();

    // Wait for component to be created so that UI components like the InfiniteLoader can determine
    // the exact size and location of the element when it is first rendered.
    await form.resolveAfterCreate();

    // Trigger the load as would be done by the UI so that we can populate options, etc... This adds
    // extra latency (~100ms), but it is a useful construct. Load listeners, especially those that
    // take a while, should be avoided.
    form.emitLoad();
    await form.resolveAfterLoad();

    return form;
  }

  async _produceFormWaitForLoadAndPushForm(forms) {
    const form = await this._produceFormAndWaitForLoad();

    forms.push(form);
  }

  async _onAddItems(edges, beforeKey) {
    // It is much more efficient to batch the creation and event waiting on the forms so that the
    // promises can be executed concurrently.

    const forms = [];
    const promises = [];

    for (let i = 0; i < edges.length; i++) {
      promises.push(this._produceFormWaitForLoadAndPushForm(forms));
    }

    await Promise.all(promises);

    // To reduce latency, mute changes for individual forms. InfiniteLoader will emit a change event
    // after all the forms have been added.
    const muteChange = true;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const node = edge.node;

      const values = {
        id: node.id,
        userId: node.userId,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        archivedAt: node.archivedAt
      };
      const form = forms[i];

      form.eachField(field => {
        // Field exists in returned records?
        const val = node.fieldValues[field.get('name')];
        if (val) {
          values[field.get('name')] = val;
        }
      });

      this._addForm({
        form,
        values,
        muteChange,
        cursor: edge.cursor,
        beforeKey
      });
    }
  }

  produce() {
    // Note: a previous design cloned an instance of a form to generate a new form. Cloning a form
    // is VERY slow, it requires a recursive dive into the instance because the original class
    // structure isn't immediately recoverable once a class has been instantiated. Instead, it is
    // much faster to generate a form via a factory.
    const factory = this.get('formFactory');
    return factory.produce();
  }

  _addFormSynchronous(args) {
    const form = this.produce();
    return this._addForm(Object.assign({ form }, args));
  }

  async _addFormAsynchronous(args) {
    const form = await this._produceFormAndWaitForLoad();
    return this._addForm(Object.assign({ form }, args));
  }

  addForm({ form, values, muteChange, cursor, beforeKey, synchronous }) {
    const args = { values, muteChange, cursor, beforeKey };
    if (form) {
      // A form is being supplied so save some CPU processing by using the form instead of
      // generating another form
      return this._addForm(Object.assign({ form }, args));
    } else if (synchronous) {
      // Add the form synchronously, i.e. don't wait for any events
      return this._addFormSynchronous(args);
    } else {
      // Add the form asynchronously, i.e. wait for the didCreate and didLoad events
      return this._addFormAsynchronous(args);
    }
  }

  _clearAllFormListeners() {
    this.eachForm(form => form.removeAllListeners());
  }

  _validateValueType(value) {
    let hasError = false;

    if (value === null) {
      // No error
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] !== 'object') {
        hasError = true;
      } else {
        // No error
      }
    } else {
      hasError = true;
    }

    this._hasTypeError = hasError;
  }

  _setValue(value) {
    this._validateValueType(value);
    if (!this._hasTypeError) {
      // TODO: what's the best way to set? e.g. if we set the same values over and over then we end
      // up recreating the forms each time. Would it be better to just use index to set and if there
      // are indexes that are in the current forms, but not in values then just delete?
      this._clearAllFormListeners(); // prevent listener leaks
      this._forms.clear();

      if (value && value.length > 0) {
        // Note: we add the form synchronously because set() and get() must remain synchronous (core
        // design principle of MSON). In other words, we don't wait for the didCreate or didLoad
        // events when creating the form.
        const synchronous = true;
        value.forEach(values => this.addForm({ values, synchronous }));
      }

      // Emit change so that UI is notified
      this.set({ change: value });
    }
  }

  removeForm(id, muteChange) {
    if (!muteChange) {
      // Inform the InfiniteLoader that we are removing an item so that it can adjust it's buffer,
      // etc...
      this._infiniteLoader.removeItem(id);
    }

    const form = this._forms.get(id);
    form.removeAllListeners();
    this._forms.delete(id);

    if (!muteChange) {
      // Emit change so that UI is notified
      this.set({ change: form.getValues() });
    }

    return form;
  }

  removeFormIfExists(id, muteChange) {
    if (this._forms.has(id)) {
      return this.removeForm(id, muteChange);
    }
  }

  getForm(id) {
    return this._forms.get(id);
  }

  eachForm(onForm) {
    this._forms.each((form, id, last) => onForm(form, id, last));
  }

  _setForAllForms(props) {
    this.eachForm(form => form.set(props));
  }

  _setOnAllForms(props, propNames, expValue) {
    propNames.forEach(name => {
      if (
        props[name] !== undefined &&
        (expValue === undefined || props[name] === expValue)
      ) {
        this._setForAllForms({ [name]: props[name] });
      }
    });
  }

  _prepareForm(form) {
    form.setTouched(false);
    form.clearErrs();
    form.setDirty(false);
  }

  _setCurrentForm(currentForm) {
    const form = this.get('form');
    if (currentForm === null) {
      form.clearValues();
    } else {
      const values = currentForm.getValues();
      form.clearValues();
      form.set({ value: values });
      this._set('currentForm', currentForm);
    }
    this._prepareForm(form);
  }

  _readMode() {
    const form = this.get('form');
    form.emitChange('beginRead', form.getValue('id'));
    form.setEditable(false);
  }

  _createMode() {
    const form = this.get('form');
    form.emitChange('beginCreate');
    form.setEditable(true);
  }

  _updateMode() {
    const form = this.get('form');
    form.emitChange('beginUpdate', form.getValue('id'));
    form.setEditable(true);
  }

  _emitEndEvents() {
    const form = this.get('form');
    const id = form.getValue('id');
    switch (this._mode) {
      case 'create':
        form.emitChange('endCreate', id);
        break;

      case 'update':
        form.emitChange('endUpdate', id);
        break;

      default:
        // case 'read':
        form.emitChange('endRead', id);
        break;
    }
  }

  _setMode(mode) {
    // Has a previous mode?
    if (this._mode) {
      this._emitEndEvents();
    }

    // Note: we set the parent here instead of in set() as otherwise we create a circular
    // dependency that the Compiler doesn't support.
    const form = this.get('form');
    form.set({ parent: this });

    switch (mode) {
      case 'create':
        this._createMode();
        break;

      case 'update':
        this._updateMode();
        break;

      case 'read':
        this._readMode();
        break;

      default:
        break;
    }

    form.set({ mode });
    this._set('mode', mode);
  }

  _generateForm(factory) {
    // Generate a form so that we have access to the field names, etc...
    const form = factory.produce();
    this.set({ form });
  }

  set(props) {
    super.set(
      Object.assign({}, props, {
        currentForm: undefined,
        mode: undefined,
        store: undefined
      })
    );

    // Set properties on all forms
    this._setOnAllForms(props, ['disabled', 'editable', 'pristine']);

    // Only set properties of forms if property is false
    this._setOnAllForms(props, ['dirty', 'touched'], false);

    // Only set properties of forms if property is null
    this._setOnAllForms(props, ['err'], null);

    if (props.currentForm !== undefined) {
      this._setCurrentForm(props.currentForm);
    }

    if (props.mode !== undefined && props.mode !== this._mode) {
      this._setMode(props.mode);
    }

    if (props.store !== undefined) {
      this._setStore(props.store);
    }
  }

  _getValue() {
    return this._forms.map(form => {
      return form.getValues();
    });
  }

  getOne(name) {
    if (name === 'value') {
      return this._getValue();
    }

    if (name === 'form' && !this._form) {
      // We have to generate a form immediately so that we have a place holder for the UI. After we
      // receive didLoad, we'll regenerate the form so that we'll also have the loaded data.
      // Generating the form on demand allows us to instantiate a factory where the product is a
      // missing template parameter, which is useful for testing.
      this._generateForm(this.get('formFactory'));
    }

    return super.getOne(name);
  }

  *getForms() {
    yield* this._forms.values();
  }

  updateForm({ values, muteChange, cursor, beforeKey }) {
    const fieldForm = this._forms.get(values.id);
    fieldForm.setValues(values);
    fieldForm.set({ cursor });
    return fieldForm;
  }

  upsertForm({ values, muteChange, cursor, beforeKey }) {
    if (this._forms.has(values.id)) {
      return this.updateForm({
        values,
        muteChange,
        cursor,
        beforeKey
      });
    } else {
      return this.addForm({
        values,
        muteChange,
        cursor,
        beforeKey
      });
    }
  }

  async _saveForm(form) {
    const id = form.getField('id');
    const store = this.get('store');
    const creating = id.isBlank();
    let fieldForm = null;

    if (store) {
      let record = null;
      // New?
      if (creating) {
        record = await store.createDoc({ form });
      } else {
        // Existing
        record = await store.updateDoc({ form, id: id.getValue() });
      }
      form.setValues({
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      });
    } else if (creating) {
      // TODO: use the id from this._docs.set instead of this dummy id
      id.setValue(utils.uuid());
    }

    fieldForm = this.upsertForm({
      // Specify the form so that we don't have to generate another one
      form,
      values: form.getValues(),
      muteChange: false,
      cursor: form.get('cursor')
    });

    form.emitChange(
      creating ? 'didCreateRecord' : 'didUpdateRecord',
      id.getValue()
    );

    this._globals.displaySnackbar(this.getSingularLabel() + ' saved');

    return fieldForm;
  }

  async save() {
    const form = this.get('form');

    // No errors?
    form.setTouched(true);
    form.validate();
    if (form.getErrs().length === 0) {
      const fieldForm = await this._saveForm(form);

      // Set the currentForm to the new/updated form so that subsequent viewing or editing uses this
      // new data
      //
      // TODO: create a prop called 'readAfterSave' that sets the mode to read instead of null
      //
      // this.set({ currentForm: fieldForm, mode: 'read' });
      this.set({ currentForm: fieldForm, mode: null });
    }
  }

  async archive(form) {
    const store = this.get('store');
    if (store) {
      const record = await store.archiveDoc({ form, id: form.getValue('id') });
      form.setValues({ archivedAt: record.archivedAt });
    }

    // // Not showing archived?
    // if (!this.get('showArchived')) {

    // Remove from list. We have to use removeFormIfExists as there may be a race condition where
    // the store has already resulted in the form being removed.
    this.removeFormIfExists(form.getValue('id'));

    // }

    form.emitChange('didArchiveRecord', form.getValue('id'));

    this._globals.displaySnackbar(this.getSingularLabel() + ' deleted');
  }

  async restore(form) {
    const store = this.get('store');
    if (store) {
      await store.restoreDoc({ form, id: form.getValue('id') });
    }

    form.setValues({ archivedAt: null });

    // Remove from list as assume that we are only viewing archived items. We have to use
    // removeFormIfExists as there may be a race condition where the store has already resulted in
    // the form being removed. TODO: make this configurable via a param to restore?
    this.removeFormIfExists(form.getValue('id'));

    form.emitChange('didRestoreRecord', form.getValue('id'));

    this._globals.displaySnackbar(this.getSingularLabel() + ' restored');
  }

  reachedMax() {
    const maxSize = this.get('maxSize');
    return maxSize !== null && this._forms.length() >= maxSize;
  }

  validate() {
    super.validate();

    let errors = [];
    for (const form of this._forms.values()) {
      form.validate();
      if (form.hasErr()) {
        errors.push({
          id: form.getField('id').getValue(),
          error: form.getErrs()
        });
      }
    }

    const numForms = this._forms.length();

    const minSize = this.get('minSize');
    const maxSize = this.get('maxSize');

    if (minSize !== null && numForms < minSize) {
      errors.push({
        error: `${minSize} or more`
      });
    } else if (maxSize !== null && numForms > maxSize) {
      errors.push({
        error: `${maxSize} or less`
      });
    }

    if (this._hasTypeError) {
      errors.push({ error: 'must be an array of objects' });
    }

    if (errors.length > 0) {
      this.setErr(errors);
    }
  }

  getSingularLabel() {
    if (this.get('singularLabel')) {
      return this.get('singularLabel');
    } else if (this.get('label')) {
      // Automatically calculate singular label by removing last 's'
      const label = this.get('label');
      return label.substr(0, label.length - 1);
    } else {
      return null;
    }
  }

  isBlank() {
    let isBlank = true;
    for (const form of this.getForms()) {
      if (!form.isBlank()) {
        isBlank = false;
        break;
      }
    }
    return isBlank;
  }

  // TODO: why does using this cause the following error? TypeError: Method get
  // TypedArray.prototype.length called on incompatible receiver [object Object] at Uint8Array.get
  // length [as length] (<anonymous>). See collection-field.test.js, it('should clone') for example
  //
  // clone() {
  //   const clonedField = super.clone();
  //
  //   // Clone form so that cloned field has a reference to a different form
  //   this.set({ form: this.get('form').clone() });
  //
  //   return clonedField;
  // }

  getUniqueItemId(id) {
    return this.getUniqueId() + '-item-' + id;
  }
}
