import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '../form-control';
import attach from '../attach';
import HelpToolTip from './help-tool-tip';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  label: {
    fontSize: theme.typography.caption.fontSize
  }
});

class CommonField extends React.PureComponent {
  render() {
    const {
      component,
      children,
      label,
      required,
      fullWidth,
      err,
      editable,
      touched,
      help,
      hideLabelUI,
      hideLabel,
      classes,
      useDisplayValue,
      shrinkLabel
    } = this.props;

    let fld = null;

    let lbl = null;

    const isBlank = component.isBlank();

    if (!hideLabelUI && !hideLabel) {
      if (editable && !useDisplayValue) {
        lbl = (
          <InputLabel
            error={touched && err ? true : false}
            required={required}
            shrink={shrinkLabel}
          >
            {label}
          </InputLabel>
        );
      } else {
        lbl = <FormLabel className={classes.label}>{label}</FormLabel>;
      }
    }

    const firstErr = component.getFirstErr();

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

    if (editable || !isBlank) {
      return <FormControl fullWidth={fullWidth}>{fld}</FormControl>;
    } else {
      return null;
    }
  }
}

// 'value' is needed in the event we are showing the display value
CommonField = attach([
  'label',
  'required',
  'fullWidth',
  'value',
  'err',
  'editable',
  'touched',
  'help',
  'hideLabel',
  'useDisplayValue'
])(CommonField);

export default withStyles(styles)(CommonField);
