import Component from '../component';
import sift from 'sift';

export default class Action extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'if', 'ifData');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'if', 'ifData');
    return value === undefined ? super.getOne(name) : value;
  }

  // Abstract method
  async act(/* props */) {}

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
      return this.act(props);
    }
  }
}
