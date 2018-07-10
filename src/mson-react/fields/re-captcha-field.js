import React from 'react';
import attach from '../attach';
import ReCAPTCHA from 'react-google-recaptcha';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  captcha: {
    margin: theme.spacing.unit
  }
});

class ReCAPTCHAField extends React.PureComponent {
  handleChange = value => {
    this.props.field.setValue(value);
  };

  render() {
    const { disabled, editable, accessEditable, siteKey, classes } = this.props;

    const isEditable = accessEditable !== false && editable && !disabled;

    if (isEditable) {
      return (
        <div className={classes.captcha}>
          <ReCAPTCHA
            ref="recaptcha"
            sitekey={siteKey}
            onChange={this.handleChange}
          />
        </div>
      );
    } else {
      return null;
    }
  }
}

ReCAPTCHAField = withStyles(styles)(ReCAPTCHAField);

export default attach(['disabled', 'editable', 'siteKey'])(ReCAPTCHAField);
