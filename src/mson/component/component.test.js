import Component from './component';
import Action from '../actions/action';
import testUtils from '../test-utils';
import Form from '../form';
import compiler from '../compiler';
import Set from '../actions/set';

class Song extends Component {
  _create(props) {
    super._create(props);

    this._nameSpy = this.get('name');

    this.set({
      props: ['song', 'artist'],
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'song',
            component: 'TextField'
          },
          {
            name: 'artist',
            component: 'TextField'
          }
        ]
      }
    });
  }
}

class SongAction extends Action {
  acts = [];

  async act(props) {
    // Wait until next tick
    await testUtils.timeout();
    this.acts.push({
      event: props.event
    });
  }
}

it('should get', () => {
  const song = new Song();
  const obj = { song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' };
  song.set(obj);
  expect(song.get('song')).toEqual("It Don't Mean a Thing");
  expect(song.get(['song'])).toEqual({ song: "It Don't Mean a Thing" });
  expect(song.get(['song', 'artist'])).toEqual(obj);
  expect(song.get()).toEqual(
    Object.assign(obj, { schema: song.get('schema') })
  );
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
        actions: [action1, action2]
      },
      {
        event: 'artist',
        actions: [action1]
      }
    ]
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

it('should concat schemas', () => {
  const c = new Component({
    schema: 'one'
  });
  c.set({ schema: 'two' });
  c.set({ schema: 'three' });
  expect(c.get('schema')).toEqual([
    c._getComponentMSONSchema(),
    'one',
    'two',
    'three'
  ]);
});

it('should valiate schema', () => {
  const component = new Component();
  const schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  expect(schemaForm.hasField('name')).toEqual(true);

  schemaForm.setValues({
    component: 'myComponent',
    name: 'myName',
    listeners: [
      {
        event: 'myEvent',
        actions: [new Action()]
      }
    ],
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'TextField'
        }
      ]
    },
    store: true,
    props: ['foo']
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(false);

  schemaForm.setValues({
    name: 'myField',
    badParam: 10
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);
  expect(schemaForm.getErrs()).toEqual([
    {
      field: 'badParam',
      error: 'undefined field'
    }
  ]);
});

it('should valid with a compiled schema', () => {
  const component = new Component();

  // Validation fails as foo not in schema
  let schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  schemaForm.setValues({
    name: 'myName',
    foo: 'bar'
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);

  // Set compiled schema
  const schema = {
    component: 'Form',
    fields: [
      {
        name: 'foo',
        component: 'TextField'
      }
    ]
  };
  component.set({
    props: ['foo'],
    schema: compiler.newComponent(schema)
  });
  schemaForm = new Form();
  component.buildSchemaForm(schemaForm, compiler);
  schemaForm.setValues({
    name: 'myName',
    foo: 'bar'
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
            value: name
          }),
          new Set({
            name: 'artist'
          })
        ]
      }
    ]
  });

  await testUtils.once(song, 'didCreate');

  expect(song.get('artist'), name);
});

it('should filter listeners based on layer', async () => {
  const action1 = new SongAction({ layer: 'backEnd' });
  const action2 = new SongAction();
  const action3 = new SongAction({ layer: 'frontEnd' });

  const song = new Song({
    listeners: [
      {
        event: 'song',
        actions: [action1, action2, action3]
      }
    ]
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
