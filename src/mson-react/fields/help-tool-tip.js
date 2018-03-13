// TODO: make full width of field include right margin if there is help?

import React from 'react';
import { IconButton, Tooltip } from 'material-ui';
import { HelpOutline } from 'material-ui-icons';

export default class HelpToolTip extends React.Component {
  render() {
    const { help } = this.props;
    return (
      <Tooltip title={help}>
        <IconButton aria-label="Help">
          <HelpOutline />
        </IconButton>
      </Tooltip>
    );
  }
}
