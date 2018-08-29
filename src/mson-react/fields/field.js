import React from 'react';
import components from '../components';
import compiler from '../../mson/compiler';
import attach from '../attach';
import FlexBreak from '../flex-break';

// Use MSON React Component instead?
class Field extends React.PureComponent {
  render() {
    const {
      field,
      hidden,
      block,
      accessEditable,
      didCreate,
      noBlock
    } = this.props;

    // Don't show the component until didCreate is true as we may need to wait for fields to be
    // hidden or otherwise modified by listeners
    if (hidden || !didCreate) {
      return null;
    } else {
      const name = field.getClassName();

      let Field = components[name];
      if (!Field) {
        // The React component wasn't found so check the MSON layer to see if we can automatically
        // determine the component from any MSON.
        let ext = compiler.getOldestCompiledAncestor(name);
        Field = components[ext];
      }

      return (
        <span>
          <Field field={field} accessEditable={accessEditable} />
          {!noBlock && block ? <FlexBreak /> : null}
        </span>
      );
    }
  }
}

export default attach(['hidden', 'block', 'didCreate'])(Field);
