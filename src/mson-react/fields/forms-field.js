import React from 'react';
import Grid from '@material-ui/core/Grid';
import FormCard from '../form-card';
import FormDialog from '../form-dialog';
import attach from '../attach';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import ConfirmationDialog from '../confirmation-dialog';

// TODO:
//   - Currently, when a form is edited it results in changing this component's state and
//     rerendering all the forms. Is this ok? Will this scale?
//   - Support drag to order

// Note:
//   - We use a dialog to view/edit the forms as we want to be able to display just a few pieces
//     of data in the list and all the data when viewing/editing.

class FormsField extends React.Component {
  state = {
    open: false, // TODO: rename to openDialog
    mode: 'view',
    currentForm: null,
    confirmationOpen: false
  };

  constructor(props) {
    super(props);

    // We clone the form once and share it among view/edit so that the UI is consistently bound to
    // this form. TODO: what happens if the form instance changes? Do we care?
    this.state.currentForm = props.field.get('form').clone();
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  prepareForm(form) {
    form.setTouched(false);
    form.clearErrs();
    form.setDirty(false);
  }

  handleClick = form => {
    const { currentForm } = this.state;
    currentForm.clearValues();
    currentForm.setValues(form.getValues());
    currentForm.setEditable(false);
    this.prepareForm(currentForm);
    this.setState({ open: true, mode: 'view' });
  };

  handleEdit = form => {
    const { currentForm } = this.state;

    // The forms will be the same if the user clicks edit from view form dialog
    if (form !== currentForm) {
      currentForm.clearValues();
      currentForm.setValues(form.getValues());
    }

    currentForm.setEditable(true);
    this.prepareForm(currentForm);

    this.setState({ open: true, mode: 'edit' });
  };

  handleNew = () => {
    const { currentForm } = this.state;
    currentForm.clearValues();
    currentForm.setEditable(true);
    this.prepareForm(currentForm);
    this.setState({ open: true, mode: 'new' });
  };

  handleSave = async () => {
    const { field } = this.props;
    const { currentForm } = this.state;

    // No errors?
    currentForm.setTouched(true);
    currentForm.validate();
    if (currentForm.getErrs().length === 0) {
      await field.save(currentForm);
      this.handleClose();
    }
  };

  handleDelete = async form => {
    // Set the id so that it can be deleted after the confirmation
    const { currentForm } = this.state;
    currentForm.getField('id').setValue(form.getField('id').getValue());

    const archivedAt = form.get('archivedAt');

    // Are we restoring?
    if (archivedAt) {
      await this.props.field.restore(form);
    } else {
      const singularLabel = this.props.field.getSingularLabel().toLowerCase();

      this.setState({
        open: false,
        confirmationOpen: true,
        confirmationTitle: `Are you sure you want to delete this ${singularLabel}?`
      });
    }
  };

  handleConfirmationClose = async yes => {
    if (yes) {
      await this.props.field.archive(this.state.currentForm);
    }
    this.setState({ confirmationOpen: false });
  };

  cards() {
    const {
      field,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled
    } = this.props;

    let cards = [];
    let index = 0;

    for (const f of field.getForms()) {
      f.setEditable(false);
      const archivedAt = f.get('archivedAt');
      cards.push(
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <FormCard
            onClick={() => this.handleClick(f)}
            onEdit={() => this.handleEdit(f)}
            onDelete={this.handleDelete}
            form={f}
            forbidUpdate={forbidUpdate}
            forbidDelete={forbidDelete}
            editable={editable}
            disabled={disabled}
            archivedAt={archivedAt}
          />
        </Grid>
      );
      index++;
    }

    return cards;
  }

  render() {
    const {
      forbidCreate,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      field
    } = this.props;
    const {
      open,
      mode,
      currentForm,
      confirmationOpen,
      confirmationTitle
    } = this.state;
    const reachedMax = field.reachedMax();

    const singularLabel = field.getSingularLabel();

    return (
      <div>
        <Grid container spacing={0}>
          {this.cards()}
        </Grid>

        {!editable || disabled || forbidCreate || reachedMax ? (
          ''
        ) : (
          <Button color="primary" aria-label="new" onClick={this.handleNew}>
            <AddIcon />
            New {singularLabel}
          </Button>
        )}

        {/* TODO: would it be better to have a single, global FormDialog instance? Or, is it better
        to have multiple instances so that you can have different memory spaces. Currenly we have a
        hybrid where we have a dialog per form. There is almost certainly more overhead in having an
        instance per record, right? */}
        <FormDialog
          open={open}
          mode={mode}
          form={currentForm}
          onClose={this.handleClose}
          onSave={this.handleSave}
          onEdit={this.handleEdit}
          onDelete={this.handleDelete}
          forbidUpdate={forbidUpdate}
          forbidDelete={forbidDelete}
          editable={editable}
          disabled={disabled}
        />

        <ConfirmationDialog
          open={confirmationOpen}
          onClose={this.handleConfirmationClose}
          title={confirmationTitle}
        />
      </div>
    );
  }
}

export default attach([
  'change',
  'label',
  'singularLabel',
  'forbidCreate',
  'forbidUpdate',
  'forbidDelete',
  'editable',
  'disabled'
])(FormsField);
