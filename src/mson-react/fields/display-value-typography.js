import React from 'react';
import Typography from '@material-ui/core/Typography';

export default class DisplayValueTypography extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <Typography variant="subheading">{children}</Typography>;
  }
}
