import React from 'react';
import TextField from './text-field';
import attach from '../attach';

class URLField extends React.PureComponent {
  render() {
    const {
      component,
      value,
      editable,
      useDisplayValue,
      newWindow
    } = this.props;

    let displayValue = null;

    // Note: editable & useDisplayValue are checked to avoid unnecessary rendering
    if ((!editable || useDisplayValue) && value) {
      let href = value;
      if (href.indexOf('http') !== 0) {
        href = 'http://' + href;
      }
      displayValue = (
        <a href={href} target={newWindow ? '_blank' : '_self'}>
          {value}
        </a>
      );
    }

    return <TextField component={component} displayValue={displayValue} />;
  }
}

export default attach(['value', 'editable', 'useDisplayValue', 'newWindow'])(
  URLField
);
