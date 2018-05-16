import React from 'react';
import Input from '@material-ui/core/Input';
import CommonField from './common-field';
import attach from '../attach';

class TextField extends React.Component {
  handleChange = event => {
    this.props.field.setValue(event.target.value);
  };

  handleBlur = () => {
    this.props.field.setTouched(true);
  };

  render() {
    const {
      value,
      err,
      maxLength,
      touched,
      disabled,
      field,
      fullWidth,
      type
    } = this.props;

    return (
      <CommonField field={field}>
        <Input
          error={touched && err ? true : false}
          inputProps={{
            maxLength: maxLength
          }}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={value ? value : ''}
          disabled={disabled}
          fullWidth={fullWidth}
          type={type}
        />
      </CommonField>
    );
  }
}

export default attach([
  'value',
  'err',
  'maxLength',
  'touched',
  'disabled',
  'fullWidth',
  'type'
])(TextField);
