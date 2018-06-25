import React from 'react';
import Button from './button';
import { Dialog, DialogActions, withMobileDialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import { ModeEdit, Delete, Save, Cancel, Restore } from '@material-ui/icons';
import Form from './form';
import attach from './attach';

class FormDialog extends React.PureComponent {
  handleClose = withCancelButton => {
    // Prevent the user from losing data when pressing esc or clicking outside dialog
    const { mode, onClose } = this.props;
    if (withCancelButton || mode !== 'update') {
      if (onClose) {
        onClose();
      }
    }
  };

  handleEdit = () => {
    if (this.props.onEdit) {
      this.props.onEdit(this.props.form);
    }
  };

  handleSave = event => {
    // Stop the form from refreshing the page
    event.preventDefault();

    if (this.props.onSave) {
      this.props.onSave();
    }
  };

  handleDelete = () => {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.form);
    }
  };

  isOpen() {
    return !!this.props.mode;
  }

  render() {
    const { mode, form, forbidUpdate, forbidDelete, archivedAt } = this.props;

    const disableSave = form.hasErrorForTouchedField() || !form.get('dirty');

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
              iconComponent={ModeEdit}
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
FormDialog = attach(['err', 'dirty', 'archivedAt'], 'form')(FormDialog);
export default FormDialog;
