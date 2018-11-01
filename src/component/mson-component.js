import WrappedComponent from './wrapped-component';
import registrar from '../compiler/registrar';

// Allows you to define to a component in MSON, which isn't built until the component is
// instantiated
export default class MSONComponent extends WrappedComponent {
  _className = 'MSONComponent';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'definition',
            component: 'Field',
            required: true
          }
        ]
      }
    });

    // We want the class name to be that of the wrapped component
    this._preserveClassName = false;

    // For mocking
    this._registrar = registrar;
  }

  // Set the compiler so that we can have separate compiler spaces per list of components
  _setCompiler(compiler) {
    this._compiler = compiler;
  }

  _getCompiler() {
    const compiler = this._compiler ? this._compiler : this._registrar.compiler;
    if (compiler) {
      return compiler;
    } else {
      throw new Error('compiler has not been registered with registrar');
    }
  }

  set(props) {
    super.set(props);

    if (props.definition !== undefined) {
      const compiler = this._getCompiler();
      const component = compiler.newComponent(props.definition);
      this.setComponentToWrap(component);
    }
  }
}
