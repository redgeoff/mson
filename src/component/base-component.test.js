import BaseComponent from './base-component';
import Action from '../actions/action';
import testUtils from '../test-utils';
import Form from '../form';
import TextField from '../fields/text-field';
import compiler from '../compiler';
import Set from '../actions/set';
import Emit from '../actions/emit';
import MemoryStore from '../stores/memory-store';
import { PersonFullNameField } from '../fields';

class Song extends BaseComponent {
  _create(props) {
    super._create(props);

    this._nameSpy = this.get('name');

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'song',
            component: 'TextField',
          },
          {
            name: 'artist',
            component: 'TextField',
          },
        ],
      },
    });
  }
}

class SongAction extends Action {
  acts = [];

  async act(props) {
    // Wait until next tick
    await testUtils.timeout();
    this.acts.push({
      event: props.event,
    });

    if (this._throwErr) {
      throw this._throwErr;
    }
  }
}

it('should get', () => {
  const song = new Song();
  const obj = { song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' };
  song.set(obj);
  expect(song.get('song')).toEqual("It Don't Mean a Thing");
  expect(song.get(['song'])).toEqual({ song: "It Don't Mean a Thing" });
  expect(song.get(['song', 'artist'])).toEqual(obj);
  const values = song.get();
  expect(values.song).toEqual(obj.song);
  expect(values.artist).toEqual(obj.artist);
});

it('should set name before creating', () => {
  const song = new Song({ name: 'Thriller' });
  expect(song._nameSpy).toEqual('Thriller');
});

it('should execute listeners', async () => {
  const action1 = new SongAction();
  const action2 = new SongAction();

  const song = new Song({
    listeners: [
      {
        event: 'song',
        actions: [action1, action2],
      },
      {
        event: 'artist',
        actions: [action1],
      },
    ],
  });

  song.set({ song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' });

  await testUtils.waitFor(() => {
    return action1.acts.length === 2 && action2.acts.length === 1
      ? true
      : undefined;
  });

  expect(action1.acts).toEqual([{ event: 'song' }, { event: 'artist' }]);
  expect(action2.acts).toEqual([{ event: 'song' }]);
});

it('should execute listener with an array of events', async () => {
  const action = new SongAction();

  const song = new Song({
    listeners: [
      {
        event: ['song', 'artist'],
        actions: [action],
      },
    ],
  });

  song.set({ song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' });

  await testUtils.waitFor(() => {
    return action.acts.length === 2 ? true : undefined;
  });

  expect(action.acts).toEqual([{ event: 'song' }, { event: 'artist' }]);
});

it('should run listeners when there are none', async () => {
  const song = new Song({});
  await song.runListeners();
});

it('should emit errors for detached actions', async () => {
  const action = new SongAction({ detached: true });
  action._throwErr = new Error();

  const song = new Song({
    listeners: [
      {
        event: 'artist',
        actions: [action],
      },
    ],
  });

  const errThrown = testUtils.once(song, 'actionErr');

  await song.runListeners('artist');

  const results = await errThrown;
  expect(results[0]).toEqual(action._throwErr);
});

it('should log errors when action is detached', () => {
  const song = new Song();
  song._registrar = {
    log: {
      error: () => {},
    },
  };
  const logSpy = jest.spyOn(song._registrar.log, 'error');
  const err = new Error();

  song._onDetachedActionErr(err);
  expect(logSpy).toHaveBeenCalledWith(err);
});

it('should valiate schema', () => {
  const component = new BaseComponent();
  const schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  expect(schemaForm.hasField('name')).toEqual(true);

  schemaForm.setValues({
    component: 'myComponent',
    name: 'myName',
    listeners: [
      {
        event: 'myEvent',
        actions: [new Action()],
      },
    ],
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'TextField',
        },
      ],
    },
    isStore: true,
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(false);

  schemaForm.setValues({
    name: 'myField',
    badParam: 10,
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);
  expect(schemaForm.getErrs()).toEqual([
    {
      field: 'badParam',
      error: 'undefined field',
    },
  ]);
});

it('should validate with a compiled schema', () => {
  const component = new BaseComponent();

  // Validation fails as foo not in schema
  let schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  schemaForm.setValues({
    name: 'myName',
    foo: 'bar',
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);

  // Set compiled schema
  const schema = {
    component: 'Form',
    fields: [
      {
        name: 'foo',
        component: 'TextField',
      },
    ],
  };
  component.set({
    schema: compiler.newComponent(schema),
  });
  schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  schemaForm.setValues({
    name: 'myName',
    foo: 'bar',
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(false);
});

it('should chain listeners', async () => {
  const name = 'Michael Jackson';

  const song = new Song({
    listeners: [
      {
        event: 'create',
        actions: [
          new Set({
            value: name,
          }),
          new Set({
            name: 'artist',
          }),
        ],
      },
    ],
  });

  await testUtils.once(song, 'didCreate');

  expect(song.get('artist')).toEqual(name);
});

it('should filter listeners based on layer', async () => {
  const action1 = new SongAction({ layer: 'backEnd' });
  const action2 = new SongAction();
  const action3 = new SongAction({ layer: 'frontEnd' });

  const song = new Song({
    listeners: [
      {
        event: 'song',
        actions: [action1, action2, action3],
      },
    ],
  });

  // Simulate no layer
  song._getLayer = () => null;

  await song.runListeners('song');
  expect(action1.acts).toHaveLength(1);
  expect(action2.acts).toHaveLength(1);
  expect(action3.acts).toHaveLength(1);

  action1.acts = [];
  action2.acts = [];
  action3.acts = [];

  // Simulate frontEnd layer
  song._getLayer = () => 'frontEnd';

  await song.runListeners('song');
  expect(action1.acts).toHaveLength(0);
  expect(action2.acts).toHaveLength(1);
  expect(action3.acts).toHaveLength(1);
});

it('should set layer', () => {
  BaseComponent.setLayer('frontEnd');
  expect(BaseComponent.getLayer()).toEqual('frontEnd');

  // Restore the default so that we don't affect any other tests
  BaseComponent.setLayer(null);
});

it('set should throw error if props is not an object', () => {
  const song = new Song();
  expect(() => song.set('foo')).toThrow();
});

it('should set unique keys', () => {
  const component1 = new BaseComponent();
  const component2 = new BaseComponent();
  expect(component1.getKey()).not.toEqual(component2.getKey());
  expect(component1.getUniqueId()).not.toEqual(component2.getUniqueId());
});

it('should get isLoaded', async () => {
  const component = new BaseComponent();
  expect(component.isLoaded()).toEqual(false);
});

it('should emit create even when cloned', async () => {
  const component = new BaseComponent();
  const clonedComponent = component.clone();
  await testUtils.once(clonedComponent, 'create');
});

it('should clone', () => {
  const component = new BaseComponent({
    name: 'a',
  });

  const clonedComponent = component.clone();

  component.set({ name: 'c' });

  expect(component.get('name')).toEqual('c');
  expect(clonedComponent.get('name')).toEqual('a');

  clonedComponent.set({ name: 'b' });

  expect(component.get('name')).toEqual('c');
  expect(clonedComponent.get('name')).toEqual('b');
});

it('cloneSlow should shallow clone parent', () => {
  const parent = new BaseComponent();
  const component = new BaseComponent({ parent });
  const clonedComponent = component._cloneSlow();
  expect(clonedComponent.get('parent')).toEqual(parent);
});

it('should set with dot notation', () => {
  const fullName = {
    firstName: 'Tom',
    lastName: 'Petty',
  };

  const form = new Form({
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'Field',
        },
        {
          name: 'person',
          component: 'Field',
        },
      ],
    },
    fields: [
      new TextField({
        name: 'firstName',
        label: 'First Name',
      }),
      new PersonFullNameField({
        name: 'fullName',
      }),
    ],
    person: {
      profile: {
        fullName,
      },
      profession: 'Musician',
    },
  });

  expect(form.getField('firstName').get('label')).toEqual('First Name');
  form.set({
    'fields.firstName.label': 'First Name Modified',
  });
  expect(form.getField('firstName').get('label')).toEqual(
    'First Name Modified'
  );

  form.set({ 'person.profile.fullName.firstName': 'Thomas' });
  expect(form.get('person').profile.fullName.firstName).toEqual('Thomas');

  form.set({ 'person.profile.fullName': fullName });
  expect(form.get('person').profile.fullName).toEqual(fullName);

  form.set({ 'fields.fullName.firstName.value': 'Tom' });
  expect(form.getField('fullName').getValue().firstName).toEqual('Tom');

  // The last property is a component
  form.set({
    'fields.fullName.firstName': {
      label: 'First Name Modified',
    },
  });
  expect(form.getField('fullName').get('firstName').get('label')).toEqual(
    'First Name Modified'
  );
});

it('should get with dot notation', () => {
  const fullName = {
    firstName: 'Tom',
    lastName: 'Petty',
  };

  const form = new Form({
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'Field',
        },
        {
          name: 'person',
          component: 'Field',
        },
        {
          name: 'child',
          component: 'Field',
        },
      ],
    },
    fields: [
      new TextField({
        name: 'firstName',
        label: 'First Name',
      }),
    ],
    person: {
      fullName,
      profession: 'Musician',
    },
    child: new TextField({
      name: 'child',
    }),
  });

  expect(form.get('fields.firstName.label')).toEqual('First Name');

  expect(() => form.get('fields.missingField.value')).toThrow(
    'fields.missingField not found'
  );

  // Nested component
  expect(form.get('child.name')).toEqual('child');
  expect(form.get('child.hidden')).toEqual(false);

  expect(() => form.get('foo.value')).toThrow('foo not found');

  expect(form.get('person.fullName')).toEqual(fullName);
  expect(form.get('person.fullName.firstName')).toEqual(fullName.firstName);

  expect(() => form._getSubProperty('person.missing', 2)).toThrow(
    'person.missing not found'
  );
});

it('set should throw if property not defined', () => {
  const component = new BaseComponent();
  expect(() => component.set({ undefinedProperty: 'foo' })).toThrow(
    'Component: undefinedProperty not defined'
  );
});

it('get should throw if property not defined', () => {
  const component = new BaseComponent();
  expect(() => component.get('undefinedProperty')).toThrow(
    'Component: undefinedProperty not defined'
  );
});

it('should listen to sub events on fields', async () => {
  const form = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' }),
    ],
    listeners: [
      {
        event: 'fields.firstName.value',
        actions: [
          new Set({ name: 'fields.lastName.value' }),
          new Emit({ event: 'didGetFirstName' }),
        ],
      },
    ],
  });

  // Wait for sub event listeners to be created
  await form.resolveAfterCreate();

  const didGetFirstName = testUtils.once(form, 'didGetFirstName');
  form.setValues({
    firstName: 'Max',
  });
  await didGetFirstName;
  expect(form.getValues({ default: false })).toEqual({
    firstName: 'Max',
    lastName: 'Max',
  });
});

it('should listen to sub events on property', async () => {
  const store = new MemoryStore();

  const form = new Form({
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'store',
          component: 'Field',
        },
      ],
    },
    store,
    fields: [new TextField({ name: 'firstName' })],
    listeners: [
      {
        event: 'store.createDoc',
        actions: [
          new Set({
            name: 'fields.firstName.value',
            value: '{{arguments.value.fieldValues.firstName}}',
          }),
          new Emit({ event: 'didCreateDoc' }),
        ],
      },
    ],
  });

  const form2 = new Form({
    fields: [new TextField({ name: 'firstName', value: 'Max' })],
  });

  // Wait for sub event listeners to be created
  await form.resolveAfterCreate();

  const didCreateDoc = testUtils.once(form, 'didCreateDoc');
  await store.createDoc({ form: form2 });
  await didCreateDoc;
  expect(form.getValues({ default: false })).toEqual({
    firstName: 'Max',
  });
});

it('should not duplicate sub event listeners', () => {
  const component = new BaseComponent({
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'store',
          component: 'Field',
        },
      ],
    },
    store: new MemoryStore(),
  });
  const listenToSubEventSpy = jest.spyOn(component, '_listenToSubEvent');

  component._listenIfNewSubEvent('store.updateDoc');
  expect(listenToSubEventSpy).toHaveBeenCalledWith('store.updateDoc');

  component._listenIfNewSubEvent('store.updateDoc');
  expect(listenToSubEventSpy).toHaveBeenCalledTimes(1);
});

it('should emit error when running listeners', async () => {
  const component = new BaseComponent();

  // Sanity check for the test coverage
  expect(component._shouldThrowActionErrors()).toEqual(
    BaseComponent._throwActionErrors
  );

  // Mock so that our test ignores the value of BaseComponent._throwActionErrors
  jest
    .spyOn(component, '_shouldThrowActionErrors')
    .mockImplementation(() => true);

  // Mock
  const err = new Error();
  component.runListeners = async () => {
    throw err;
  };

  const onActionErrSpy = jest.spyOn(component, '_onActionErr');

  await expect(component._runListenersAndEmitError()).rejects.toThrowError(err);
  expect(onActionErrSpy).toHaveBeenCalledWith(err);

  // Now expect not to throw
  jest
    .spyOn(component, '_shouldThrowActionErrors')
    .mockImplementation(() => false);
  onActionErrSpy.mockReset();
  await component._runListenersAndEmitError();
  expect(onActionErrSpy).toHaveBeenCalledWith(err);
});

it('should destroy', () => {
  const component = new BaseComponent();
  const removeAllListenersSpy = jest.spyOn(component, 'removeAllListeners');
  component.destroy();
  expect(removeAllListenersSpy).toHaveBeenCalledTimes(1);
});

it('should parent class name', () => {
  const textField = new TextField();
  expect(textField.getParentClassName()).toEqual('Field');

  const personFullNameField = new PersonFullNameField();
  expect(personFullNameField.getParentClassName()).toEqual('CompositeField');
});

it('should support getters', () => {
  const schema = {
    component: 'Form',
    fields: [
      {
        name: 'foo',
        component: 'Field',
      },
    ],
  };

  const innerComponent = new BaseComponent({ schema });

  const outerComponent = new BaseComponent({ schema });

  innerComponent.set({ foo: 'bar' });
  outerComponent.set({ foo: innerComponent });
  expect(outerComponent.get('foo.foo')).toEqual('bar');
  expect(outerComponent.foo.foo).toEqual('bar');
});
