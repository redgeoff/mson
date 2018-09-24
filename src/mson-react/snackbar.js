import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
// import Button from '@material-ui/core/Button';
import SnackbarMUI from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import Icon from './icon';

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
});

class Snackbar extends React.PureComponent {
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    const { classes, message, open } = this.props;
    return (
      <SnackbarMUI
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          // <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
          //   UNDO
          // </Button>,
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}
          >
            <Icon icon="Close" />
          </IconButton>
        ]}
      />
    );
  }
}

Snackbar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Snackbar);
