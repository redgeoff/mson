import React from 'react';
import attach from '../attach';
import Button from '../button';

class ButtonField extends React.Component {
  handleClick = () => {
    const { type } = this.props;

    // Is the button not a submit button? Let the form handle submit buttons so that the form
    // perform validation
    if (type !== 'submit') {
      this.props.field.emitClick();
    }
  }

  render() {
    const { label, type, disabled, icon } = this.props;
    return (
      <Button type={type} label={label} disabled={disabled} onClick={this.handleClick} icon={icon} />
    )
  }
}

export default attach(['label', 'type', 'disabled', 'icon'])(ButtonField);
