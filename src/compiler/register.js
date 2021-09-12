import compiler from './compiler';

const register = (componentOrName, component) => {
  let name = componentOrName;
  if (!component) {
    component = componentOrName;
    name = component.name;
  }
  compiler.registerComponent(name, component);
};

export default register;
