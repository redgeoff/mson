// TODO: would it be better to have a create-composite-field, pass in the Field and reuse code?

import React from 'react';
import ListItemField from './list-item-field';
import attach from '../attach';

class ListField extends React.Component {
  render() {
    const { field, help } = this.props;
    const allowDelete = field.get('allowDelete');

    let fields = [];
    let first = true;

    field.eachField((field, index, last) => {
      let itemHelp = null;

      if (field.get('block')) {
        if (first) {
          itemHelp = help;
          first = false;
        }
      } else {
        if (last) {
          itemHelp = help;
        }
      }

      // We have to pass allowDelete as it is the allowDelete of the parent
      fields.push(<ListItemField field={field} key={index} allowDelete={allowDelete} help={itemHelp} />);
    });

    return fields;
  }
};

// We want the component to update when we receive new fields
export default attach(['fields', 'help'])(ListField);
