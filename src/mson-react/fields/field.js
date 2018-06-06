import React from 'react';
import components from '../components';
import compiler from '../../mson/compiler';
import attach from '../attach';
import FlexBreak from '../flex-break';

// Use MSON React Component instead?
class Field extends React.PureComponent {
  render() {
    const { field, hidden, block } = this.props;

    if (hidden) {
      return null;
    } else {
      const name = field.getClassName();

      let Field = components[name];
      if (!Field) {
        // The React component wasn't found so check the MSON layer to see if we can automatically
        // determine the component from any MSON.
        let ext = compiler.getOldestNonMSONAncestor(name);
        Field = components[ext];
      }

      return (
        <span>
          <Field field={field} />
          {block ? <FlexBreak /> : null}
        </span>
      );
    }
  }
}

export default attach(['hidden', 'block'])(Field);
