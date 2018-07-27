import WrappedComponent from './wrapped-component';
import registrar from '../compiler/registrar';

// Allows you to define to a component in MSON, which isn't built until the component is
// instantiated
export default class MSONComponent extends WrappedComponent {
  _create(props) {
    super._create(props);

    // We want the class name to be that of the wrapped component
    this._preserveClassName = false;
  }

  // Set the compiler so that we can have separate compiler spaces per list of components
  _setCompiler(compiler) {
    this._compiler = compiler;
  }

  set(props) {
    if (props.definition !== undefined) {
      const compiler = this._compiler ? this._compiler : registrar.compiler;
      if (compiler) {
        const component = compiler.newComponent(props.definition);
        this.setComponentToWrap(component);
      } else {
        throw new Error('compiler has not been registered with registrar');
      }
    }

    super.set(props);
  }
}
