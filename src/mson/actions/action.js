import Component from '../component';
import sift from 'sift';
import PropFiller from '../compiler/prop-filler';
import registrar from '../compiler/registrar';
import globals from '../globals';
import Form from '../form';

export default class Action extends Component {
  _create(props) {
    super._create(props);

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
            name: 'detach',
            component: 'BooleanField'
          }
        ]
      }
    });
  }

  _getSession() {
    return registrar.client ? registrar.client.user.getSession() : undefined;
  }

  _getGlobals() {
    return {
      session: this._getSession(),
      ...globals.get()
    };
  }

  // Abstract method
  async act(/* props */) {}

  _formToFillerProps(component) {
    const fields = {};
    component.eachField(
      field => (fields[field.get('name')] = { value: field.get('value') })
    );
    return fields;
  }

  _fill(prop) {
    const propFiller = new PropFiller(this._fillerProps);

    // Fill with props from coponent first so that we define default values in the component like
    // {{fields.to.value}} that are then filled via the second fill.
    prop = propFiller.fill(prop);
    prop = propFiller.fill(prop); // Yes, this is duplicate is needed!

    return prop;
  }

  _getFilled(names) {
    let prop = super.get(names);
    return prop === null ? null : this._fill(prop);
  }

  get(names) {
    return this._getFilled(names);
  }

  _setFillerProps(props) {
    this._fillerProps = {};

    if (props) {
      if (props.component) {
        this._fillerProps = Object.assign(
          this._fillerProps,
          props.component.get()
        );

        if (props.component instanceof Form) {
          // Replace the component with values that can be used to fill
          this._fillerProps.fields = this._formToFillerProps(props.component);
        }
      }

      this._fillerProps.arguments = props.arguments;
    }

    this._fillerProps.globals = this._getGlobals();
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
            arguments: args
          });
        }
        return args;
      } else {
        return this.act(props);
      }
    }
  }
}
