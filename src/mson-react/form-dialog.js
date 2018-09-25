import React from 'react';
import Button from './button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogContent from '@material-ui/core/DialogContent';
import Form from './form';
import attach from './attach';

class FormDialog extends React.PureComponent {
  state = { saveClicked: false, previousMode: null };

  handleClose = withCancelButton => {
    // Prevent the user from losing data when pressing esc or clicking outside dialog
    const { mode, onClose, onRead } = this.props;
    if (withCancelButton || mode !== 'update') {
      if (mode === 'update') {
        if (onRead) {
          onRead(this.props.currentForm);
        }
      } else {
        if (onClose) {
          onClose(this.props.currentForm);
        }
      }
    }
  };

  handleEdit = () => {
    if (this.props.onEdit) {
      this.props.onEdit(this.props.currentForm);
    }
  };

  handleSave = event => {
    // Stop the form from refreshing the page
    event.preventDefault();

    if (this.props.onSave) {
      this.props.onSave();
    }

    // Disable the save button so that the user sees that something is being processed
    this.setState({ saveClicked: true });
  };

  handleDelete = () => {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.currentForm);
    }
  };

  isOpen() {
    return !!this.props.mode;
  }

  componentDidUpdate(prevProps) {
    // If the mode or err changes then allow the user to click save
    if (
      this.props.mode !== prevProps.mode ||
      this.props.err !== prevProps.err
    ) {
      this.setState({ saveClicked: false });
    }

    if (this.props.mode !== prevProps.mode) {
      this.setState({ previousMode: prevProps.mode });
    }
  }

  render() {
    const { mode, component, forbidUpdate, forbidDelete, value } = this.props;

    const { saveClicked, previousMode } = this.state;

    const disableSave =
      component.hasErrorForTouchedField() ||
      !component.get('dirty') ||
      saveClicked;

    const open = this.isOpen();

    let buttons = null;

    // Note: we analyze the previousMode so that the user isn't flashed with new buttons immediately
    // after they click save or close the dialog
    if (
      mode === 'update' ||
      mode === 'create' ||
      (mode === null &&
        (previousMode === 'update' || previousMode === 'create'))
    ) {
      buttons = (
        <div>
          {/* We use type=submit so that the form is submitted when the user presses enter */}
          <Button
            type="submit"
            label="Save"
            icon="Save"
            disabled={disableSave}
          />
          <Button
            label="Cancel"
            icon="Cancel"
            onClick={() => this.handleClose(true)}
          />
        </div>
      );
    } else if (!forbidUpdate || !forbidDelete) {
      buttons = (
        <div>
          {forbidUpdate ? (
            ''
          ) : (
            <Button label="Edit" icon="Edit" onClick={this.handleEdit} />
          )}
          {forbidDelete ? (
            ''
          ) : (
            <Button
              label={value.archivedAt ? 'Restore' : 'Delete'}
              icon={value.archivedAt ? 'Restore' : 'Delete'}
              onClick={this.handleDelete}
            />
          )}
          <Button
            label="Close"
            icon="Cancel"
            onClick={() => this.handleClose(true)}
          />
        </div>
      );
    }

    return (
      <Dialog
        open={open}
        onClose={() => this.handleClose(false)}
        aria-labelledby="form-dialog-title"
      >
        {/* We use a form element so that we can submit the form on enter */}
        <form onSubmit={this.handleSave}>
          <DialogContent>
            <Form component={component} formTag={false} mode={mode} />
          </DialogContent>
          {buttons ? <DialogActions>{buttons}</DialogActions> : ''}
        </form>
      </Dialog>
    );
  }
}

FormDialog = withMobileDialog()(FormDialog);
FormDialog = attach(['err', 'dirty', 'value', 'mode'])(FormDialog);
export default FormDialog;
