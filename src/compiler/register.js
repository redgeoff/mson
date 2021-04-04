import compiler from './compiler';

const register = (component) => {
  compiler.registerComponent(component.name, component);
};

export default register;
