import React from 'react';
import Input from '@material-ui/core/Input';
import CommonField from './common-field';
import attach from '../attach';
import DisplayValueTypography from './display-value-typography';
import MaskedInput from 'react-text-mask';

class TextField extends React.PureComponent {
  constructor(props) {
    super(props);

    // Create a custom TextMask component. This is done once in the constructor so that it is not
    // done in each call to render()
    this.TextMaskCustom = props => {
      const { inputRef, ...other } = props;
      const { mask } = this.props;

      return <MaskedInput {...other} ref={inputRef} mask={mask} />;
    };
  }

  handleChange = event => {
    const { component } = this.props;
    const value = component.fromUIValue(event.target.value);
    component.setValue(value);
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
      useDisplayValue,
      mask,
      displayValue
    } = this.props;

    const dis = accessEditable === false || disabled;

    let fld = null;
    if (editable && !useDisplayValue) {
      const optional = {};
      if (mask) {
        optional.inputComponent = this.TextMaskCustom;
      }
      const uiValue = component.getUIValue();

      fld = (
        <Input
          error={touched && err ? true : false}
          inputProps={{
            maxLength: maxLength
          }}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyUp={this.handleKeyUp}
          value={uiValue ? uiValue : ''}
          disabled={dis}
          fullWidth={fullWidth}
          type={type}
          multiline={multiline}
          rows={rows}
          rowsMax={rowsMax}
          {...optional}
        />
      );
    } else {
      fld = (
        <DisplayValueTypography>
          {displayValue ? displayValue : component.getDisplayValue()}
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
  'useDisplayValue',
  'mask',
  'unmask'
])(TextField);
