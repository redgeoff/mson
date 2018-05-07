import Component from './component';
import utils from '../utils';

// Used to create a component that can be dynamically defined on demand
export default class WrappedComponent extends Component {
  constructor(props) {
    super(props);
    if (props.componentToWrap) {
      this.setComponentToWrap(props.componentToWrap);
    }
  }

  setComponentToWrap(componentToWrap) {
    this._componentToWrap = componentToWrap;
    this._wrapComponent();
  }

  _wrapComponent() {
    const names = utils.getAllMethodNames(this._componentToWrap);
    names.forEach(name => {
      const property = this._componentToWrap[name];
      if (this._componentToWrap[name]) {
        this[name] = (...args) => {
          return property.apply(this._componentToWrap, args);
        };
      }
    });
  }
}
