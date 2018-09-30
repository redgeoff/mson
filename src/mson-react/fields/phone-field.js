import React from 'react';
import TextField from './text-field';

export default class PhoneField extends React.PureComponent {
  render() {
    const { component } = this.props;
    return <TextField component={component} />;
  }
}
