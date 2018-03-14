import React from 'react';
import Button from './button';
import Dialog, {
  DialogActions,
  DialogContent,
  withMobileDialog
} from 'material-ui/Dialog';
import { ModeEdit, Delete, Save, Cancel } from 'material-ui-icons';
import Form from './form';
import attach from './attach';

class FormDialog extends React.Component {
  state = {
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = withCancelButton => {
    // Prevent the user from losing data when pressing esc or clicking outside dialog
    if (withCancelButton || this.props.mode !== 'edit') {
      this.setState({ open: false });

      if (this.props.onClose) {
        this.props.onClose();
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.state.open) {
      this.setState({ open: nextProps.open });
    }
  }

  render() {
    const {
      mode,
      form,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled
    } = this.props;

    const disableSave = form.hasErrorForTouchedField() || !form.get('dirty');

    let buttons = null;

    if (mode === 'edit' || mode === 'new') {
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
    } else if (editable && !disabled && (!forbidUpdate || !forbidDelete)) {
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
              label="Delete"
              iconComponent={Delete}
              onClick={this.handleDelete}
            />
          )}
        </div>
      );
    }

    return (
      <Dialog
        open={this.state.open}
        onClose={() => this.handleClose(false)}
        aria-labelledby="form-dialog-title"
      >
        {/* We use a form element so that we can submit the form on enter */}
        <form onSubmit={this.handleSave}>
          <DialogContent>
            <Form form={form} formTag={false} />
          </DialogContent>
          {buttons ? <DialogActions>{buttons}</DialogActions> : ''}
        </form>
      </Dialog>
    );
  }
}

FormDialog = withMobileDialog()(FormDialog);
FormDialog = attach(['err', 'dirty'], 'form')(FormDialog);
export default FormDialog;
