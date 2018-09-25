import React from 'react';
import components from './components';
import compiler from '../mson/compiler';

export default class Component extends React.PureComponent {
  render() {
    const { component } = this.props;
    const name = component.getClassName();

    let Component = components[name];
    if (!Component) {
      // The React component wasn't found so check the MSON layer to see if we can automatically
      // determine the component from any MSON.
      let ext = compiler.getOldestCompiledAncestor(name);
      Component = components[ext];
    }

    return <Component component={component} />;
  }
}
