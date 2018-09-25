import React from 'react';
import attach from '../attach';
import Button from '../button';

class ButtonField extends React.PureComponent {
  handleClick = () => {
    const { type } = this.props;

    // Is the button not a submit button? Let the form handle submit buttons so that the form
    // performs the validation
    if (type !== 'submit') {
      this.props.component.emitClick();
    }
  };

  render() {
    const { label, type, disabled, icon, fullWidth, variant } = this.props;
    return (
      <Button
        type={type}
        label={label}
        disabled={disabled}
        onClick={this.handleClick}
        icon={icon}
        fullWidth={fullWidth}
        variant={variant}
      />
    );
  }
}

export default attach([
  'label',
  'type',
  'disabled',
  'icon',
  'fullWidth',
  'variant'
])(ButtonField);
