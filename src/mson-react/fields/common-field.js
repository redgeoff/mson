import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import FormControl from '../form-control';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';

class CommonField extends React.Component {
  render() {
    const {
      field,
      children,
      label,
      required,
      fullWidth,
      err,
      editable,
      touched,
      help
    } = this.props;

    let fld = null;

    if (editable) {
      fld = (
        <span>
          <InputLabel error={touched && err ? true : false} required={required}>
            {label}
          </InputLabel>
          {children}
          {help && editable ? <HelpToolTip help={help} /> : ''}
          {touched && err ? <FormHelperText error>{err}</FormHelperText> : null}
        </span>
      );
    } else {
      fld = (
        <Typography variant="subheading">{field.getDisplayValue()}</Typography>
      );
    }

    return <FormControl fullWidth={fullWidth}>{fld}</FormControl>;
  }
}

// 'value' is needed in the event we are showing the display value
export default attach([
  'label',
  'required',
  'fullWidth',
  'value',
  'err',
  'editable',
  'touched',
  'help'
])(CommonField);
