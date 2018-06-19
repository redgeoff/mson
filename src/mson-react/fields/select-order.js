import React from 'react';
import { Button } from '@material-ui/core';
import { Sort } from '@material-ui/icons';

export default class SelectOrder extends React.PureComponent {
  render() {
    return (
      <Button color="primary" aria-label="new" onClick={this.handleOrder}>
        <Sort />
      </Button>
    );
  }
}
