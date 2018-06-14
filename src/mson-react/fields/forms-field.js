import React from 'react';
import Grid from '@material-ui/core/Grid';
import FormCard from '../form-card';
import FormDialog from '../form-dialog';
import attach from '../attach';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import ConfirmationDialog from '../confirmation-dialog';
import access from '../../mson/access';
import { withStyles } from '@material-ui/core/styles';
import { blueGrey } from '@material-ui/core/colors';
import './forms-field.css';

// TODO:
//   - Do we really need currentForm and targetForm? Should we refactor out currentForm? May still
//     need currentForm as need to be able to toggle editable attributes?
//   - Currently, when a form is edited it results in changing this component's state and
//     rerendering all the forms. Is this ok? Will this scale?
//   - Support drag to order

// Note:
//   - We use a dialog to view/edit the forms as we want to be able to display just a few pieces
//     of data in the list and all the data when viewing/editing.

const styles = theme => ({
  spacer: {
    backgroundColor: blueGrey[100],
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    animation: 'fadeIn 1s infinite alternate'
  },
  footer: {
    // Create space at the footer so that it is more evident to the user that the next page has been
    // loaded
    height: 50,
    backgroundColor: blueGrey[100],
    margin: theme.spacing.unit,
    animation: 'fadeIn 1s infinite alternate'
  }
});

class FormsField extends React.PureComponent {
  state = {
    open: false, // TODO: rename to openDialog
    mode: 'view',
    currentForm: null,
    confirmationOpen: false,
    targetForm: null
  };

  constructor(props) {
    super(props);

    // TODO: just use form in props intead of different item in state?
    this.state.currentForm = props.field.get('form');
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  prepareForm(form) {
    form.setTouched(false);
    form.clearErrs();
    form.setDirty(false);
  }

  copyValues(currentForm, form) {
    currentForm.setValues(form.getValues());
    currentForm.set({ userId: form.get('userId') });
  }

  handleClick = form => {
    const { currentForm } = this.state;
    currentForm.clearValues();
    this.copyValues(currentForm, form);
    currentForm.setEditable(false);
    this.prepareForm(currentForm);
    this.setState({ open: true, mode: 'view', targetForm: form });
  };

  handleEdit = form => {
    const { currentForm } = this.state;

    // The forms will be the same if the user clicks edit from view form dialog
    if (form !== currentForm) {
      currentForm.clearValues();
      this.copyValues(currentForm, form);
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
    const { currentForm, open, targetForm } = this.state;
    currentForm.getField('id').setValue(form.getField('id').getValue());

    // Use the targetForm when specified
    const formToDelete = targetForm ? targetForm : form;

    const archivedAt = formToDelete.get('archivedAt');

    // Are we restoring?
    if (archivedAt) {
      await this.props.field.restore(formToDelete);

      // Is the dialog open?
      if (open) {
        // Close it
        this.setState({ open: false, targetForm: null });
      }
    } else {
      // const singularLabel = this.props.field.getSingularLabel().toLowerCase();

      this.setState({
        targetForm: formToDelete,
        open: false,
        confirmationOpen: true,
        // confirmationTitle: `Are you sure you want to delete this ${singularLabel}?`
        confirmationTitle: 'Delete this?'
      });
    }
  };

  handleConfirmationClose = async yes => {
    if (yes) {
      await this.props.field.archive(this.state.targetForm);
    }
    this.setState({ confirmationOpen: false, targetForm: null });
  };

  canCreate() {
    return access.canCreate(this.props.field.get('form'));
  }

  canUpdate() {
    return access.canUpdate(this.props.field.get('form'));
  }

  canArchive() {
    return access.canArchive(this.props.field.get('form'));
  }

  componentDidUpdate(prevProps) {
    if (this.props.bufferTopId !== prevProps.bufferTopId) {
      // Resize the spacer now that the newly prepended items have been rendered
      this.props.field._infiniteLoader.resizeSpacer(this.props.bufferTopId);
    }

    if (this.props.spacerHeight !== prevProps.spacerHeight) {
      this.props.field._infiniteLoader.setSpacerResizing(false);
    }

    if (this.props.change !== prevProps.change) {
      this.props.field.set({ isLoading: false });
    }
  }

  cards(canUpdate, canArchive) {
    const {
      field,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled
    } = this.props;

    let cards = [];

    for (const f of field.getForms()) {
      f.setEditable(false);

      // We need to use the id for the key as we use the same list of cards when toggling
      // showArchive
      const key = f.getValue('id');

      // Note: we use an id instead of ref so that more of our logic can be reused across different
      // frameworks.
      const id = field.getUniqueItemId(key);

      cards.push(
        <Grid item xs={12} sm={6} lg={6} key={key} id={id}>
          <FormCard
            onClick={() => this.handleClick(f)}
            onEdit={() => this.handleEdit(f)}
            onDelete={this.handleDelete}
            form={f}
            forbidUpdate={forbidUpdate || !canUpdate}
            forbidDelete={forbidDelete || !canArchive}
            editable={editable}
            disabled={disabled}
          />
        </Grid>
      );
    }

    return cards;
  }

  // TODO: how to prevent re-rendering of all form-cards when dialog open state is changed?
  render() {
    const {
      forbidCreate,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      field,
      spacerHeight,
      classes,
      isLoading
    } = this.props;
    const {
      open,
      mode,
      currentForm,
      confirmationOpen,
      confirmationTitle,
      targetForm
    } = this.state;
    const reachedMax = field.reachedMax();

    const singularLabel = field.getSingularLabel();

    const canCreate = this.canCreate();
    const canUpdate = this.canUpdate();
    const canArchive = this.canArchive();

    const archivedAt = targetForm ? targetForm.get('archivedAt') : null;

    const spacerStyle = { height: spacerHeight };

    const spacerId = field.get('spacerId');

    return (
      <div>
        {!editable || disabled || forbidCreate || reachedMax || !canCreate ? (
          ''
        ) : (
          <Button color="primary" aria-label="new" onClick={this.handleNew}>
            <AddIcon />
            New {singularLabel}
          </Button>
        )}

        <div id={spacerId} className={classes.spacer} style={spacerStyle} />

        <Grid container spacing={0}>
          {this.cards(canUpdate, canArchive)}
        </Grid>

        {isLoading ? <div className={classes.footer} /> : null}

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
          forbidUpdate={forbidUpdate || !canUpdate}
          forbidDelete={forbidDelete || !canArchive}
          editable={editable}
          disabled={disabled}
          archivedAt={archivedAt}
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

FormsField = withStyles(styles)(FormsField);
FormsField = attach([
  'change',
  'label',
  'singularLabel',
  'forbidCreate',
  'forbidUpdate',
  'forbidDelete',
  'editable',
  'disabled',
  'spacerHeight',
  'bufferTopId',
  'isLoading'
])(FormsField);
export default FormsField;
