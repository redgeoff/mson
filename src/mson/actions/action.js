import Component from '../component';
import sift from 'sift';
import PropFiller from '../compiler/prop-filler';
import registrar from '../compiler/registrar';

export default class Action extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'if', 'ifData', 'actions');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'if', 'ifData', 'actions');
    return value === undefined ? super.getOne(name) : value;
  }

  _getGlobals() {
    return {
      session: registrar.client ? registrar.client.user.getSession() : undefined
    };
  }

  // Abstract method
  async act(/* props */) {}

  _fill(prop, props) {
    if (!props) {
      props = {};
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
          if (!args && props && props.args) {
            args = props.args;
          }
          args = await actions[i].run({
            ...props,
            arguments: args
          });
        }
      } else {
        return this.act(props);
      }
    }
  }
}
