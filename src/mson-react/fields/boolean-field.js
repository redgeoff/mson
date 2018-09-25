import React from 'react';
import Switch from '@material-ui/core/Switch';
import CommonField from './common-field';
import attach from '../attach';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class BooleanField extends React.PureComponent {
  handleChange = event => {
    this.props.component.setValue(event.target.checked);
  };

  render() {
    const { value, disabled, component } = this.props;

    const label = component.get('label');

    return (
      <CommonField component={component} hideLabelUI="true">
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
