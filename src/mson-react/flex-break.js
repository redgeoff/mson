import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  // break: {
  //   flexBasis: '100%',
  //   width: '0px',
  //   height: '0px',
  //   overflow: 'hidden'
  // }
  break: {
    width: '100%'
  }
});

class FlexBreak extends React.PureComponent {
  render() {
    const { classes } = this.props;
    return <div className={classes.break} />;
  }
}

export default withStyles(styles)(FlexBreak);
