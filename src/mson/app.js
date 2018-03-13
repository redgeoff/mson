import Component from './component';

export default class App extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'menu');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'menu');
    return value === undefined ? super.getOne(name) : value;
  }
}
