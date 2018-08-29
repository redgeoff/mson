import React from 'react';
import Field from './field';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';
import FlexBreak from '../flex-break';

class CompositeField extends React.PureComponent {
  render() {
    const { field, help, editable } = this.props;

    let fields = [];

    let lastIsBlock = false;

    field.eachField((field, index, last) => {
      if (last && field.get('block')) {
        lastIsBlock = true;
      }
      fields.push(<Field field={field} key={index} noBlock={last} />);
    });

    if (help && editable) {
      fields.push(<HelpToolTip help={help} key="help" />);
    }

    if (lastIsBlock) {
      // Break after any help
      fields.push(<FlexBreak />);
    }

    return fields;
  }
}

// We want the component to update when we receive new fields
export default attach(['change', 'help', 'editable'])(CompositeField);
