import React from 'react';
import attach from '../attach';
import ReCAPTCHA from 'react-google-recaptcha';

class ReCAPTCHAField extends React.PureComponent {
  handleChange = event => {
    // TODO:
    // this.props.field.setValue(event.target.value);
    console.log(event.target.value);
  };

  render() {
    const { disabled, editable, accessEditable, siteKey } = this.props;

    const _editable = accessEditable !== false && editable && !disabled;

    if (_editable) {
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
