import React from 'react';
import { FormControl as FormControlMU } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  },
  formControlFullWidth: {
    margin: theme.spacing.unit,

    // TODO: bug in material ui?
    width: `calc(100% - ${theme.spacing.unit * 2}px)`
  }
});

class FormControl extends React.Component {
  render() {
    const { fullWidth, children, classes } = this.props;

    return (
      <FormControlMU
        fullWidth={fullWidth}
        className={
          fullWidth ? classes.formControlFullWidth : classes.formControl
        }
      >
        {children}
      </FormControlMU>
    );
  }
}

export default withStyles(styles)(FormControl);
