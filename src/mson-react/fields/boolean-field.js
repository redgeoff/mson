import React from 'react';
import Switch from '@material-ui/core/Switch';
import CommonField from './common-field';
import attach from '../attach';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class BooleanField extends React.PureComponent {
  handleChange = event => {
    this.props.field.setValue(event.target.checked);
  };

  render() {
    const { value, disabled, field } = this.props;

    const label = field.get('label');

    return (
      <CommonField field={field} hideLabelUI="true">
        <FormControlLabel
          control={
            <Switch
              checked={value ? value : false}
              onChange={this.handleChange}
              value="true"
              disabled={disabled}
            />
          }
          label={label}
        />
      </CommonField>
    );
  }
}

export default attach(['value', 'err', 'disabled'])(BooleanField);
