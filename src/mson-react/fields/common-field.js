import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '../form-control';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';

class CommonField extends React.PureComponent {
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
      help,
      hideLabel
    } = this.props;

    let fld = null;

    let lbl = null;

    if (editable && !hideLabel) {
      lbl = (
        <InputLabel error={touched && err ? true : false} required={required}>
          {label}
        </InputLabel>
      );
    }

    const firstErr = field.getFirstErr(err);

    fld = (
      <span>
        {lbl}
        {children}
        {help && editable ? <HelpToolTip help={help} /> : ''}
        {touched && err ? (
          <FormHelperText error>{firstErr}</FormHelperText>
        ) : null}
      </span>
    );

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
