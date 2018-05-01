import React from 'react';
import components from './components';
import compiler from '../mson/compiler';
import Form from '../mson/form';

export default class Component extends React.Component {
  render() {
    const { component } = this.props;
    const name = component.getClassName();

    let Component = components[name];
    if (!Component) {
      // The React component wasn't found so check the MSON layer to see if we can automatically
      // determine the component from any MSON.
      let ext = compiler.getOldestNonMSONAncestor(name);
      Component = components[ext];
    }

    // TODO: standardize so that all MSON React components have a prop named component
    if (component instanceof Form) {
      return <Component form={component} />;
    } else {
      return <Component component={component} />;
    }
  }
}
