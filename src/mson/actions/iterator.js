import Action from './action';
import _ from 'lodash';
import PropFiller from '../compiler/prop-filler';

export default class Converter extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'iterator', 'return');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'iterator', 'return');
    return value === undefined ? super.getOne(name) : value;
  }

  _getProp(props, path) {
    return _.get(props, path);
  }

  async act(props) {
    const iterator = this._getProp(props, this.get('iterator'));
    console.log('iterator', iterator);
    const clonedProps = _.clone(props);
    const filler = new PropFiller(props);
    const tmp = _.map(iterator, item => {
      console.log('item', item);
      // Inject item
      clonedProps.item = item;
      filler.setProps(clonedProps);

      return filler.fillAll(this.get('return'));
    });
    console.log('tmp=', tmp);
    return tmp;
  }
}
