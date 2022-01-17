import Component from './component';
import Form from '../form/form';
import TextField from '../fields/text-field';

it('should concat schemas', () => {
  const c = new Component({
    schema: 'one',
  });
  c.set({ schema: 'two' });
  c.set({ schema: 'three' });
  expect(c.get('schema')).toEqual([
    c._getBaseComponentSchema(),
    c._getWrappedComponentSchema(),
    'one',
    'two',
    'three',
  ]);
});

const shouldSupportComponentNotations = (component, className) => {
  expect(component.get('isStore')).toEqual(true);
  expect(component.get('docLevel')).toEqual('basic');
  expect(component.getClassName()).toEqual(className);
  expect(component.get('song')).toEqual('Bamboleo');
};

const songField = new TextField({
  name: 'song',
});

const artistField = new TextField({
  name: 'artist',
});

// Legacy notation where className is specified separately
class LegacyNotationComponent extends Component {
  className = 'app.LegacyNotationComponent';

  create(props) {
    super.create(props);
    this.set({
      schema: new Form({
        fields: [songField],
      }),
      docLevel: 'basic',
    });
  }
}

it('should support legacy component notation', () => {
  const component = new LegacyNotationComponent({
    isStore: true,
    song: 'Bamboleo',
  });
  shouldSupportComponentNotations(component, 'app.LegacyNotationComponent');
});

// Condensed notation where everything is in a single create() call
class CondensedNotationComponent extends Component {
  constructor(props) {
    super({
      name: 'app.CondensedNotationComponent',
      schema: new Form({
        fields: [songField],
      }),
      docLevel: 'basic',
      ...props,
    });
  }
}

it('should support condensed component notation', () => {
  const component = new CondensedNotationComponent({
    isStore: true,
    song: 'Bamboleo',
  });
  shouldSupportComponentNotations(component, 'app.CondensedNotationComponent');
});

class ExtendedCondensedNotationComponent extends CondensedNotationComponent {
  className = 'app.ExtendedCondensedNotationComponent';

  // NOTE: we need to call this.set() after super.create() so that we don't overwrite the schema set
  // in CondensedNotationComponent
  create(props) {
    // this.className = 'app.ExtendedCondensedNotationComponent';
    super.create(props);
    this.set({
      // name: 'app.ExtendedCondensedNotationComponent',
      schema: new Form({
        fields: [artistField],
      }),
    });
  }
}

// THIS DOESN'T WORK
//
// class ExtendedCondensedNotationComponent extends CondensedNotationComponent {
//   constructor(props) {
//     super(props);
//     this.set({
//       name: 'app.ExtendedCondensedNotationComponent',
//       schema: new Form({
//         fields: [artistField]
//       })
//     });
//   }
// }

it('should support extended condensed component notation', () => {
  const component = new ExtendedCondensedNotationComponent({
    isStore: true,
    song: 'Bamboleo',
    artist: 'Gipsy Kings',
  });
  shouldSupportComponentNotations(
    component,
    'app.ExtendedCondensedNotationComponent'
  );
  expect(component.get('artist')).toEqual('Gipsy Kings');
});

const createFunctionalNotationComponent = (props) =>
  new Component({
    name: 'app.FunctionalNotationComponent',
    schema: new Form({
      fields: [songField],
    }),
    docLevel: 'basic',
    ...props,
  });

it('should support functional component notation', () => {
  const component = createFunctionalNotationComponent({
    isStore: true,
    song: 'Bamboleo',
  });
  shouldSupportComponentNotations(component, 'app.FunctionalNotationComponent');
});
