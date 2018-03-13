import React from 'react';
import Field from './field';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import FlexBreak from '../flex-break';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';

class ListItemField extends React.Component {
  handleDelete = () => {
    this.props.field.emit('delete');
  };

  render() {
    // Note: allowDelete and help have to be passed in as a prop as it is really the parent's values
    // that we need
    const { field, allowDelete, help } = this.props;
    const disabled = field.get('disabled');
    const editable = field.get('editable');

    if (field) {
      const block = field.get('block');
      const isBlank = field.isBlank();

      return (
        <span>
          <Field field={field} block={false} />
          { allowDelete && !isBlank && !disabled && editable ?
            <IconButton aria-label="Delete">
              <DeleteIcon onClick={this.handleDelete} />
            </IconButton> : null
          }
          { help && editable ? <HelpToolTip help={help} /> : '' }
          {block ? <FlexBreak /> : null}
        </span>
      );
    } else {
      // field can be falsy if it was just deleteed
      return null;
    }
  }
};

// We want the component to update when the value changes as blank fields should not display a
// delete button
export default attach(['value', 'disabled', 'editable'])(ListItemField);
