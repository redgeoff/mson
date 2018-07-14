import Component from '../component';
import sift from 'sift';
import PropFiller from '../compiler/prop-filler';
import registrar from '../compiler/registrar';
import globals from '../globals';
import Form from '../form';
import { ValidatorWhere } from '../form/form-validator';

export default class Action extends Component {
  _create(props) {
    super._create(props);

    this.set({
      props: ['if', 'ifData', 'actions', 'layer', 'detach'],
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'if',
            form: new ValidatorWhere()
          },
          {
            name: 'ifData',
            component: 'Field'
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

  _fillWithComponent(prop, props) {
    const propFiller = new PropFiller(props.component.get());
    return propFiller.fill(prop);
  }

  _fill(prop, props) {
    if (!props) {
      props = {};
    }

    if (props.component) {
      // Fill with props from coponent first so that we define default values in the component like
      // {{fields.to.value}} that are then filled via the second fill.
      prop = this._fillWithComponent(prop, props);
    }

    if (props.component && props.component instanceof Form) {
      // Replace the component with values that can be used to fill
      props.fields = this._formToFillerProps(props.component);
    }

    props.globals = this._getGlobals();
    const propFiller = new PropFiller(props);
    prop = propFiller.fill(prop);
    return prop;
  }

  getFilled(names, props) {
    let prop = super.get(names);
    return prop === null ? null : this._fill(prop, props);
  }

  get(names) {
    if (names && !Array.isArray(names)) {
      return this.getFilled(names);
    } else {
      return super.get(names);
    }
  }

  async run(props) {
    const where = this.get('if');
    let shouldRun = true;

    if (where) {
      const ifData = this.get('ifData');
      let whereProps = ifData ? ifData : this._fill(props.ifData);

      // Inject globals
      whereProps = Object.assign({ globals: this._getGlobals() }, whereProps);

      let sifted = sift(where, [whereProps]);
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
