import React from 'react';
import Button from './button';
import { Dialog, DialogActions, withMobileDialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import { Edit, Delete, Save, Cancel, Restore } from '@material-ui/icons';
import Form from './form';
import attach from './attach';

class FormDialog extends React.PureComponent {
  state = { saveClicked: false };

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
  }

  render() {
    const { mode, form, forbidUpdate, forbidDelete, archivedAt } = this.props;

    const { saveClicked } = this.state;

    const disableSave =
      form.hasErrorForTouchedField() || !form.get('dirty') || saveClicked;

    const open = this.isOpen();

    let buttons = null;

    if (mode === 'update' || mode === 'create') {
      buttons = (
        <div>
          {/* We use type=submit so that the form is submitted when the user presses enter */}
          <Button
            type="submit"
            label="Save"
            iconComponent={Save}
            disabled={disableSave}
          />
          <Button
            label="Cancel"
            iconComponent={Cancel}
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
            <Button
              label="Edit"
              iconComponent={Edit}
              onClick={this.handleEdit}
            />
          )}
          {forbidDelete ? (
            ''
          ) : (
            <Button
              label={archivedAt ? 'Restore' : 'Delete'}
              iconComponent={archivedAt ? Restore : Delete}
              onClick={this.handleDelete}
            />
          )}
          <Button
            label="Close"
            iconComponent={Cancel}
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
            <Form form={form} formTag={false} mode={mode} />
          </DialogContent>
          {buttons ? <DialogActions>{buttons}</DialogActions> : ''}
        </form>
      </Dialog>
    );
  }
}

FormDialog = withMobileDialog()(FormDialog);
FormDialog = attach(['err', 'dirty', 'archivedAt', 'mode'], 'form')(FormDialog);
export default FormDialog;
