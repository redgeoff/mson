import compiler from './compiler';

const compile = (component) => {
  return compiler.compile(component, undefined, component.name);
};

export default compile;
