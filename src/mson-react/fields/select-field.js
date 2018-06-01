import React from 'react';
import { MenuItem, Select } from '@material-ui/core';
import CommonField from './common-field';
import attach from '../attach';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  formControl: {
    // Specify a more appropriate min width so that the field is wide enough to cover most labels
    minWidth: 120
  }
});

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
    const {
      value,
      err,
      touched,
      disabled,
      field,
      fullWidth,
      classes
    } = this.props;
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
          className={classes.formControl}
        >
          {options}
        </Select>
      </CommonField>
    );
  }
}

SelectField = withStyles(styles)(SelectField);

export default attach([
  'value',
  'err',
  'options',
  'touched',
  'blankString',
  'disabled',
  'fullWidth'
])(SelectField);
