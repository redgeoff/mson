import Component from '../component';
import { filter } from '../compiler/query';
import PropFiller from '../compiler/prop-filler';
import ComponentFillerProps from '../component/component-filler-props';
import registrar from '../compiler/registrar';
import globals from '../globals';
import access from '../access';

export default class Action extends Component {
  className = 'Action';

  create(props) {
    super.create(props);

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
            component: 'WhereField',
          },
          {
            name: 'actions',
            component: 'Field',
          },
          {
            name: 'else',
            component: 'Field',
          },
          {
            name: 'layer',
            component: 'TextField',
          },
          {
            name: 'detached',
            component: 'BooleanField',
          },
        ],
      },
    });
  }

  // Abstract method
  // async act(/* props */) {}

  _fill(prop, preventQuery, customizer) {
    const propFiller = new PropFiller(this._fillerProps);

    // Fill with props from component first so that we define default values in the component like
    // {{fields.to.value}} that are then filled via the second fill.
    prop = propFiller.fill(prop, preventQuery, customizer);
    prop = propFiller.fill(prop, preventQuery); // Yes, this duplicate is needed!

    return prop;
  }

  _getFilled(names, preventQuery, customizer) {
    const prop = super.get(names);

    // When names are undefined, we need to prevent props being considered a query as a nested "if"
    // attribute is likely to contain an operator
    const prevQuery = names === undefined ? true : preventQuery;

    return prop === undefined
      ? undefined
      : this._fill(prop, prevQuery, customizer);
  }

  get(names, preventQuery, customizer) {
    return this._getFilled(names, preventQuery, customizer);
  }

  _setFillerProps(props) {
    // getFillerProps() wraps the props in a Getter so that the values can be retrieved dynamically,
    // allowing for things like retrieving data from deely nested components.
    this._fillerProps = this._componentFillerProps.getFillerProps({
      ...props,
      self: this,
    });
  }

  _setWhereProps(where, props) {
    // getWhereProps() resolves all the properties in the query and populates _whereProps. This
    // allows us to dynamically query data in deeply nested components.
    this._whereProps = this._componentFillerProps.getWhereProps(where, {
      ...props,
      self: this,
    });
  }

  async run(props) {
    this._setFillerProps(props);

    const where = this.get('if', true);
    let shouldRun = true;
    let actions = null;

    if (where) {
      this._setWhereProps(where, props);
      const filtered = filter([this._whereProps], where);
      if (filtered.length === 0) {
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
            context: props && props.context,
          });
        }
        return args;
      } else {
        return this.act(props);
      }
    }
  }
}
