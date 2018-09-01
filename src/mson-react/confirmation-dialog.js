import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class ConfirmationDialog extends React.PureComponent {
  handleClose = yes => {
    if (this.props.onClose) {
      this.props.onClose(yes);
    }
  };

  render() {
    const { title, text, open, alert } = this.props;
    return (
      <div>
        <Dialog
          open={open}
          onClose={() => this.handleClose(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {alert ? null : (
              <Button onClick={() => this.handleClose(false)} color="primary">
                No
              </Button>
            )}
            <Button
              onClick={() => this.handleClose(true)}
              color="primary"
              autoFocus
            >
              {alert ? 'OK' : 'Yes'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
