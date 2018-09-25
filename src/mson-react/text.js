import React from 'react';
import attach from './attach';
import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown';

class Text extends React.PureComponent {
  render() {
    const { text } = this.props;

    // We use component=div to force usage of a div, instead of a p, as properly formatted HTML
    // cannot nest tags like h1 under a <p>.
    return (
      <Typography component="div">
        <ReactMarkdown source={text} />
      </Typography>
    );
  }
}

Text = attach(['text'])(Text);
export default Text;
