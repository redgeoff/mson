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

class ExtendedLegacyNotationComponent extends LegacyNotationComponent {
  className = 'app.ExtendedLegacyNotationComponent';

  // NOTE: we need to call this.set() after super.create() so that we don't overwrite the schema set
  // in LegacyNotationComponent
  create(props) {
    super.create(props);
    this.set({
      schema: new Form({
        fields: [artistField],
      }),
    });
  }
}

it('should support extended legacy component notation', () => {
  const component = new ExtendedLegacyNotationComponent({
    isStore: true,
    song: 'Bamboleo',
    artist: 'Gipsy Kings',
  });
  shouldSupportComponentNotations(
    component,
    'app.ExtendedLegacyNotationComponent'
  );
  expect(component.get('artist')).toEqual('Gipsy Kings');
});

// As per https://github.com/redgeoff/mson/pull/570, the support of a className property causes
// issues with the existing legacy notation (className class member variable). In the future, we may
// want to dig deeper to identify a path forward where a className property can be utilized.
//
// // Use className property
// class CondensedNotationComponent extends Component {
//   create(props) {
//     super.create(props);
//     this.set({
//       className: 'app.CondensedNotationComponent',
//       schema: new Form({
//         fields: [songField],
//       }),
//       docLevel: 'basic',
//     });
//   }
// }
//
// it('should support condensed component notation', () => {
//   const component = new CondensedNotationComponent({
//     isStore: true,
//     song: 'Bamboleo',
//   });
//   shouldSupportComponentNotations(component, 'app.CondensedNotationComponent');
// });
//
// class ExtendedCondensedNotationComponent extends CondensedNotationComponent {
//   // NOTE: we need to call this.set() after super.create() so that we don't overwrite the schema set
//   // in CondensedNotationComponent
//   create(props) {
//     super.create(props);
//     this.set({
//       className: 'app.ExtendedCondensedNotationComponent',
//       schema: new Form({
//         fields: [artistField],
//       }),
//     });
//   }
// }
//
// it('should support extended condensed component notation', () => {
//   const component = new ExtendedCondensedNotationComponent({
//     isStore: true,
//     song: 'Bamboleo',
//     artist: 'Gipsy Kings',
//   });
//   shouldSupportComponentNotations(
//     component,
//     'app.ExtendedCondensedNotationComponent'
//   );
//   expect(component.get('artist')).toEqual('Gipsy Kings');
// });

const createFunctionalNotationComponent = (props) => {
  const component = new Component();
  component.setClassName('app.FunctionalNotationComponent');
  component.set({
    schema: new Form({
      fields: [songField],
    }),
    docLevel: 'basic',
    ...props,
  });
  return component;
};

it('should support functional component notation', () => {
  const component = createFunctionalNotationComponent({
    isStore: true,
    song: 'Bamboleo',
  });
  shouldSupportComponentNotations(component, 'app.FunctionalNotationComponent');
});

// TODO: make component.set() return component so that can chain? The difficulty is that many
// components extend set() and all these instances would have to be modified to support chaining.
const createExtendedFunctionalNotationComponent = (props) => {
  const component = createFunctionalNotationComponent();
  component.setClassName('app.ExtendedFunctionalNotationComponent');
  component.set({
    schema: new Form({
      fields: [artistField],
    }),
    ...props,
  });
  return component;
};

it('should support extended functional component notation', () => {
  const component = createExtendedFunctionalNotationComponent({
    isStore: true,
    song: 'Bamboleo',
    artist: 'Gipsy Kings',
  });
  shouldSupportComponentNotations(
    component,
    'app.ExtendedFunctionalNotationComponent'
  );
  expect(component.get('artist')).toEqual('Gipsy Kings');
});
