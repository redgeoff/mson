import React from 'react';
import attach from './attach';
import Typography from '@material-ui/core/Typography';

class Text extends React.PureComponent {
  render() {
    const { text } = this.props;

    return <Typography>{text}</Typography>;
  }
}

export default (Text = attach(['text'], 'component')(Text));
