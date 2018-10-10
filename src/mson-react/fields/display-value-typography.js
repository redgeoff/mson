import React from 'react';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    display: 'inline-block'
  }
});

class DisplayValueTypography extends React.PureComponent {
  render() {
    const { children, classes } = this.props;

    // We use a span tag so that the element is inline
    return (
      <Typography variant="subtitle1" component="span" className={classes.root}>
        {children}
      </Typography>
    );
  }
}

export default withStyles(styles)(DisplayValueTypography);
