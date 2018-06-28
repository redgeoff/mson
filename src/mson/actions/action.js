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

  // Abstract method
  async act(/* props */) {}

  getFilled(names, props) {
    if (!props) {
      props = {};
    }
    props.globals = {
      session: registrar.client ? registrar.client.user.getSession() : undefined
    };
    let prop = super.get(names);
    const propFiller = new PropFiller(props);
    prop = propFiller.fill(prop);
    return prop;
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
      const whereProps = this.get('ifData') ? this.get('ifData') : props.ifData;
      let sifted = sift(where, [whereProps]);
      if (sifted.length === 0) {
        shouldRun = false;
      }
    }

    if (shouldRun) {
      const actions = this.get('actions');

      if (actions) {
        for (const i in actions) {
          await actions[i].run(props);
        }
      } else {
        return this.act(props);
      }
    }
  }
}
