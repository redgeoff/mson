import React from 'react';
import attach from '../attach';
import ReCAPTCHA from 'react-google-recaptcha';

class ReCAPTCHAField extends React.PureComponent {
  handleChange = value => {
    this.props.field.setValue(value);
  };

  render() {
    const { disabled, editable, accessEditable, siteKey } = this.props;

    const isEditable = accessEditable !== false && editable && !disabled;

    if (isEditable) {
      return (
        <ReCAPTCHA
          ref="recaptcha"
          sitekey={siteKey}
          onChange={this.handleChange}
        />
      );
    } else {
      return null;
    }
  }
}

export default attach(['disabled', 'editable', 'siteKey'])(ReCAPTCHAField);
