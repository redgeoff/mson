import Component from './component';

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
};

// Legacy notation where className is specified separately
class LegacyNotationComponent extends Component {
  className = 'app.LegacyNotationComponent';

  create(props) {
    super.create(props);
    this.set({ docLevel: 'basic' });
  }
}

it('should support legacy component notation', () => {
  const component = new LegacyNotationComponent({ isStore: true });
  shouldSupportComponentNotations(component, 'app.LegacyNotationComponent');
});

class CondensedExtendedLegacyNotationComponent extends LegacyNotationComponent {
  constructor(props) {
    super({
      name: 'app.CondensedExtendedLegacyNotationComponent',
      docLevel: 'basic',
      ...props,
    });
  }
}

it('should support condensed extended legacy component notation', () => {
  const component = new CondensedExtendedLegacyNotationComponent({
    isStore: true,
  });
  shouldSupportComponentNotations(
    component,
    'app.CondensedExtendedLegacyNotationComponent'
  );
});

// Condensed notation where everything is in a single create() call
class CondensedNotationComponent extends Component {
  constructor(props) {
    super({
      name: 'app.CondensedNotationComponent',
      docLevel: 'basic',
      ...props,
    });
  }
}

it('should support condensed component notation', () => {
  const component = new CondensedNotationComponent({ isStore: true });
  shouldSupportComponentNotations(component, 'app.CondensedNotationComponent');
});

const createFunctionalNotationComponent = (props) =>
  new Component({
    name: 'app.FunctionalNotationComponent',
    docLevel: 'basic',
    ...props,
  });

it('should support functional component notation', () => {
  const component = createFunctionalNotationComponent({ isStore: true });
  shouldSupportComponentNotations(component, 'app.FunctionalNotationComponent');
});
