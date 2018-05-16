import React from 'react';
import { MenuItem } from '@material-ui/core/Menu';
import Select from '@material-ui/core/Select';
import CommonField from './common-field';
import attach from '../attach';

class SelectField extends React.Component {
  handleChange = event => {
    this.props.field.setValue(event.target.value);
  };

  handleBlur = () => {
    this.props.field.setTouched(true);
  };

  renderOptions() {
    const { options, blankString } = this.props;

    if (options) {
      let opts = [];

      if (blankString) {
        opts.push(
          <MenuItem value="" key="">
            <em>{blankString}</em>
          </MenuItem>
        );
      }

      options.forEach(option => {
        opts.push(
          <MenuItem value={option.value} key={option.value}>
            {option.label}
          </MenuItem>
        );
      });

      return opts;
    }
  }

  render() {
    const { value, err, touched, disabled, field, fullWidth } = this.props;
    const options = this.renderOptions();

    return (
      <CommonField field={field}>
        <Select
          error={touched && err ? true : false}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={value ? value : ''}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {options}
        </Select>
      </CommonField>
    );
  }
}

export default attach([
  'value',
  'err',
  'options',
  'touched',
  'blankString',
  'disabled',
  'fullWidth'
])(SelectField);
