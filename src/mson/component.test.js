import Component from './component';
import Action from './action';
import testUtils from './test-utils';

class Song extends Component {
  _create(props) {
    super._create(props);
    this._nameSpy = this.get('name');
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'song', 'artist');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'song', 'artist');
    return value === undefined ? super.getOne(name) : value;
  }
};

class SongAction extends Action {
  acts = []

  async act(props) {
    // Wait until next tick
    await testUtils.timeout();
    this.acts.push({
      event: props.event
    })
  }
}

it('should get', () => {
  const song = new Song();
  const obj = { song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' };
  song.set(obj);
  expect(song.get('song')).toEqual("It Don't Mean a Thing");
  expect(song.get(['song'])).toEqual({ song: "It Don't Mean a Thing" });
  expect(song.get(['song', 'artist'])).toEqual(obj);
  expect(song.get()).toEqual(obj);
});

it('should set name before creating', () => {
  const song = new Song({ name: 'Thriller' });
  expect(song._nameSpy).toEqual('Thriller');
});

it('should execute listeners', async () => {
  const action1 = new SongAction();
  const action2 = new SongAction();

  const song = new Song({ listeners: [
    {
      event: 'song',
      actions: [
        action1,
        action2
      ]
    },
    {
      event: 'artist',
      actions: [
        action1
      ]
    }
  ]});

  song.set({ song: "It Don't Mean a Thing", artist: 'Ella Fitzgerald' });

  await testUtils.waitFor(() => {
    return action1.acts.length === 2 && action2.acts.length === 1 ? true : undefined
  })

  expect(action1.acts).toEqual([ { event: 'song' }, { event: 'artist' } ]);
  expect(action2.acts).toEqual([ { event: 'song' } ]);
});
