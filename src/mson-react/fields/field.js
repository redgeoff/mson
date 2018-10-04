import React from 'react';
import components from '../components';
import compiler from '../../mson/compiler';
import attach from '../attach';
import FlexBreak from '../flex-break';

// Use MSON React Component instead?
class Field extends React.PureComponent {
  render() {
    const {
      component,
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
      const name = component.getClassName();

      let Field = components[name];
      if (!Field) {
        // The React component wasn't found so check the MSON layer to see if we can automatically
        // determine the component from any MSON.
        let ext = compiler.getOldestCompiledAncestor(name);
        Field = components[ext];
      }

      // Note: we use React.Fragment over a span as spans can cause issues with the flexbox layout
      // when displaying a nested form
      return (
        <React.Fragment>
          <Field
            component={component}
            accessEditable={accessEditable}
            block={block}
          />
          {!noBlock && block ? <FlexBreak /> : null}
        </React.Fragment>
      );
    }
  }
}

export default attach(['hidden', 'block', 'didCreate'])(Field);
