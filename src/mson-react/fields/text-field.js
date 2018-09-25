import React from 'react';
import Input from '@material-ui/core/Input';
import CommonField from './common-field';
import attach from '../attach';
import DisplayValueTypography from './display-value-typography';

class TextField extends React.PureComponent {
  handleChange = event => {
    this.props.component.setValue(event.target.value);
  };

  handleBlur = () => {
    this.props.component.setTouched(true);
  };

  handleKeyUp = event => {
    // If the user presses enter on the field then mark as touched. This is necessary for when the
    // user is using the keyboard to enter data and there is an error on the last field that needs
    // to be reported when the user presses enter.
    if (event.keyCode === 13) {
      this.props.component.setTouched(true);
    }
  };

  render() {
    const {
      value,
      err,
      maxLength,
      touched,
      disabled,
      component,
      fullWidth,
      type,
      editable,
      accessEditable,
      multiline,
      rows,
      rowsMax,
      useDisplayValue
    } = this.props;

    const dis = accessEditable === false || disabled;

    let fld = null;
    if (editable && !useDisplayValue) {
      fld = (
        <Input
          error={touched && err ? true : false}
          inputProps={{
            maxLength: maxLength
          }}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyUp={this.handleKeyUp}
          value={value ? value : ''}
          disabled={dis}
          fullWidth={fullWidth}
          type={type}
          multiline={multiline}
          rows={rows}
          rowsMax={rowsMax}
        />
      );
    } else {
      fld = (
        <DisplayValueTypography>
          {component.getDisplayValue()}
        </DisplayValueTypography>
      );
    }

    return <CommonField component={component}>{fld}</CommonField>;
  }
}

export default attach([
  'value',
  'err',
  'maxLength',
  'touched',
  'disabled',
  'fullWidth',
  'type',
  'editable',
  'multiline',
  'rows',
  'rowsMax',
  'useDisplayValue'
])(TextField);
