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
            name: 'else',
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
    return prop === undefined ? undefined : this._fill(prop);
  }

  get(names) {
    return this._getFilled(names);
  }

  _setFillerProps(props) {
    // getFillerProps() wraps the props in a Getter so that the values can be retrieved dynamically,
    // allowing for things like retrieving data from deely nested components.
    this._fillerProps = this._componentFillerProps.getFillerProps(props);
  }

  _setWhereProps(where, props) {
    // getWhereProps() resolves all the properties in the query and populates _whereProps. This
    // allows us to dynamically query data in deeply nested components.
    this._whereProps = this._componentFillerProps.getWhereProps(where, props);
  }

  async run(props) {
    this._setFillerProps(props);

    const where = this.get('if');
    let shouldRun = true;
    let actions = null;

    if (where) {
      this._setWhereProps(where, props);
      let sifted = sift(where, [this._whereProps]);
      if (sifted.length === 0) {
        // Condition failed
        if (this.get('else')) {
          actions = this.get('else');
        } else {
          // The condition failed and there is nothing to execute
          shouldRun = false;
        }
      } else {
        // Condition met
        actions = this.get('actions');
      }
    } else {
      actions = this.get('actions');
    }

    if (shouldRun) {
      if (actions) {
        let args = null;
        for (const i in actions) {
          if (!args && props && props.arguments) {
            args = props.arguments;
          }
          args = await actions[i].run({
            ...props,
            arguments: args,
            parent: this,
            context: props && props.context
          });
        }
        return args;
      } else {
        return this.act(props);
      }
    }
  }
}
