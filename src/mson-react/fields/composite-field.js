import React from 'react';
import Field from './field';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';

class CompositeField extends React.PureComponent {
  render() {
    const { field, help, editable } = this.props;

    let fields = [];

    field.eachField((field, index) => {
      fields.push(<Field field={field} key={index} />);
    });

    if (help && editable) {
      fields.push(<HelpToolTip help={help} key="help" />);
    }

    return fields;
  }
}

// We want the component to update when we receive new fields
export default attach(['fields', 'help', 'editable'])(CompositeField);
