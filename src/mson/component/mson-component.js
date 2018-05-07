import WrappedComponent from './wrapped-component';
import registrar from '../compiler/registrar';

// Allows you to define to a component in MSON, which isn't built until the component is
// instantiated
export default class MSONComponent extends WrappedComponent {
  set(props) {
    if (props.definition) {
      if (registrar.compiler) {
        const component = registrar.compiler.newComponent(props.definition);
        this.setComponentToWrap(component);
      } else {
        throw new Error('compiler has not been registered with registrar');
      }
    }

    super.set(props);
  }
}
