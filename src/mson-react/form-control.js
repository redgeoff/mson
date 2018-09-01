import React from 'react';
import FormControlMU from '@material-ui/core/FormControl';
import withStyles from '@material-ui/core/styles/withStyles';

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

class FormControl extends React.PureComponent {
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
