import Component from '../component';
import sift from 'sift';
import PropFiller from '../compiler/prop-filler';
import ComponentFillerProps from '../component/component-filler-props';
import registrar from '../compiler/registrar';
import globals from '../globals';
import access from '../access';

export default class Action extends Component {
  _className = 'Action';

  _create(props) {
    super._create(props);

    // For mocking
    this._registrar = registrar;
    this._globals = globals;
    this._access = access;

    this._componentFillerProps = new ComponentFillerProps();
    this._fillerProps = null;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'if',
            component: 'WhereField'
          },
          {
            name: 'actions',
            component: 'Field'
          },
          {
            name: 'layer',
            component: 'TextField'
          },
          {
            name: 'detached',
            component: 'BooleanField'
          }
        ]
      }
    });
  }

  // Abstract method
  // async act(/* props */) {}

  _fill(prop) {
    const propFiller = new PropFiller(this._fillerProps);

    // Fill with props from coponent first so that we define default values in the component like
    // {{fields.to.value}} that are then filled via the second fill.
    prop = propFiller.fill(prop);
    prop = propFiller.fill(prop); // Yes, this duplicate is needed!

    return prop;
  }

  _getFilled(names) {
    let prop = super.get(names);
    return this._fill(prop);
  }

  get(names) {
    return this._getFilled(names);
  }

  _setFillerProps(props) {
    // TODO: the process of generating the fillerProps is unnecessarily wasteful as it requires
    // getting properties that will not be used. We need to generate these props for *each* action
    // as a previous action may change a property on which the subsequent action depends. Instead,
    // we should be able to just use component.get() with the dot notation. And, use a selectorFn
    // with sift that uses component.get().
    this._fillerProps = this._componentFillerProps.getFillerProps(props);
  }

  async run(props) {
    this._setFillerProps(props);

    const where = this.get('if');
    let shouldRun = true;

    if (where) {
      let sifted = sift(where, [this._fillerProps]);
      if (sifted.length === 0) {
        shouldRun = false;
      }
    }

    if (shouldRun) {
      const actions = this.get('actions');

      if (actions) {
        let args = null;
        for (const i in actions) {
          if (!args && props && props.arguments) {
            args = props.arguments;
          }
          args = await actions[i].run({
            ...props,
            arguments: args,
            parent: this
          });
        }
        return args;
      } else {
        return this.act(props);
      }
    }
  }
}
