// TODO: incorporate pieces of DocStore? How to make changes real-time?
import Component from './component';

export default class RecordStore extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type');
    return value === undefined ? super.getOne(name) : value;
  }

  async create() {}

  async update() {}

  async archive() {}
}
