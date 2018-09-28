import React from 'react';
import Grid from '@material-ui/core/Grid';
import FormCard from '../form-card';
import FormDialog from '../form-dialog';
import attach from '../attach';
import Button from '../button';
import Typography from '@material-ui/core/Typography';
import ConfirmationDialog from '../confirmation-dialog';
import access from '../../mson/access';
import withStyles from '@material-ui/core/styles/withStyles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import './collection-field.css';
import SelectOrder from './select-order';
import ButtonField from '../../mson/fields/button-field';
import Icon from '../icon';
import CommonField from './common-field';

// TODO:
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

class CollectionField extends React.PureComponent {
  state = {
    confirmationOpen: false,
    sortBy: '',
    sortOrder: 'ASC'
  };

  handleClose = () => {
    this.props.component.set({ mode: null });
  };

  handleRead = form => {
    this.props.component.set({ currentForm: form, mode: 'read' });
  };

  handleClick = form => {
    this.props.component.set({ currentForm: form, mode: 'read' });
  };

  handleEdit = form => {
    this.props.component.set({ currentForm: form, mode: 'update' });
  };

  handleNew = () => {
    this.props.component.set({ currentForm: null, mode: 'create' });
  };

  handleSave = async () => {
    await this.props.component.save();
  };

  isOpen() {
    return !!this.props.mode;
  }

  handleDelete = async formToDelete => {
    const { component } = this.props;

    const open = this.isOpen();
    if (formToDelete) {
      component.set({ currentForm: formToDelete });
    } else {
      // Are we already focussed on this form
      formToDelete = component.get('form');
    }

    const archivedAt = formToDelete.getValue('archivedAt');

    // Are we restoring?
    if (archivedAt) {
      await component.restore(formToDelete);

      // Is the dialog open?
      if (open) {
        // Close it
        component.set({ mode: null });
      }
    } else {
      this.setState({
        confirmationOpen: true,
        // confirmationTitle: `Are you sure you want to delete this ${singularLabel}?`
        confirmationTitle: 'Delete this?'
      });
      component.set({ mode: null });
    }
  };

  handleConfirmationClose = async yes => {
    if (yes) {
      const { component } = this.props;
      await component.archive(component.get('form'));
    }
    this.setState({ confirmationOpen: false });
  };

  canCreate() {
    return access.canCreate(this.props.component.get('form'));
  }

  canUpdate() {
    return access.canUpdate(this.props.component.get('form'));
  }

  canArchive() {
    return access.canArchive(this.props.component.get('form'));
  }

  componentDidUpdate(prevProps) {
    if (this.props.bufferTopId !== prevProps.bufferTopId) {
      // Resize the spacer now that the newly prepended items have been rendered
      this.props.component._infiniteLoader.resizeSpacer(this.props.bufferTopId);
    }

    if (this.props.spacerHeight !== prevProps.spacerHeight) {
      this.props.component._infiniteLoader.setSpacerResizing(false);
    }

    if (this.props.change !== prevProps.change) {
      this.props.component.set({ isLoading: false });
    }
  }

  cards(canUpdate, canArchive) {
    const {
      component,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      maxColumns,
      useDisplayValue
    } = this.props;

    let cards = [];

    for (const form of component.getForms()) {
      form.setEditable(false);

      // We need to use the id for the key as we use the same list of cards when toggling
      // showArchive
      const key = form.getValue('id');

      // Note: we use an id instead of ref so that more of our logic can be reused across different
      // frameworks.
      const id = component.getUniqueItemId(key);

      const maxGrids = 12 / maxColumns;

      cards.push(
        <Grid item xs={12} sm={maxGrids} lg={maxGrids} key={key} id={id}>
          <FormCard
            onClick={() => this.handleClick(form)}
            onEdit={() => this.handleEdit(form)}
            onDelete={this.handleDelete}
            component={form}
            forbidUpdate={forbidUpdate || !canUpdate || useDisplayValue}
            forbidDelete={forbidDelete || !canArchive || useDisplayValue}
            editable={editable}
            disabled={disabled}
          />
        </Grid>
      );
    }

    return cards;
  }

  handleOrdering = props => {
    // TODO: shouldn't the ordering just be in the field and not have to be in this state?
    this.setState(props, () => {
      this.props.component.set({
        order: this.state.sortBy
          ? [[this.state.sortBy, this.state.sortOrder]]
          : null
      });
    });
  };

  sortOptions() {
    const { component } = this.props;
    if (component && component.get('form')) {
      const form = component.get('form');
      const fieldsCanAccess = access.fieldsCanAccess('read', form);
      const fields = [];
      form.eachField(field => {
        const name = field.get('name');

        // Do we have access to the field? Allowed to sort? Not hidden? Not a button?
        if (
          fieldsCanAccess[name] !== undefined &&
          !field.get('forbidSort') &&
          !field.get('hidden') &&
          !(field instanceof ButtonField)
        ) {
          fields.push({
            value: (form.isDefaultField(name) ? '' : 'fieldValues.') + name,
            label: field.get('label')
          });
        }
      });
      return fields;
    }
  }

  header(numCards) {
    const {
      forbidCreate,
      editable,
      disabled,
      component,
      forbidSort,
      store
    } = this.props;

    const { sortBy, sortOrder } = this.state;

    const singularLabel = component.getSingularLabel();

    const reachedMax = component.reachedMax();

    const canCreate = this.canCreate();

    const showNewButton =
      editable && !disabled && !forbidCreate && !reachedMax && canCreate;

    const canOrder = !forbidSort;

    const sortOptions = this.sortOptions();

    // Sorting only works when there is a backing store
    const hasStore = !!store;
    const showOrder = numCards > 0 && hasStore;

    return (
      <Grid container spacing={0}>
        <Grid item xs={12} sm={6} lg={6}>
          {showNewButton ? (
            <Button
              aria-label="new"
              onClick={this.handleNew}
              icon="Add"
              label={'New ' + singularLabel}
            />
          ) : null}
        </Grid>
        <Grid item xs={12} sm={6} lg={6} align="right">
          {showOrder && canOrder ? (
            <SelectOrder
              onChange={this.handleOrdering}
              sortBy={sortBy}
              sortOrder={sortOrder}
              options={sortOptions}
            />
          ) : null}
        </Grid>
      </Grid>
    );
  }

  // TODO: how to prevent re-rendering of all form-cards when dialog open state is changed? Or, does
  // it not really matter as we are using PureComponents?
  field() {
    const {
      forbidUpdate,
      forbidDelete,
      component,
      spacerHeight,
      classes,
      isLoading,
      form,
      currentForm,
      noResults,
      disabled,
      accessEditable,
      useDisplayValue
    } = this.props;

    const dis = accessEditable === false || disabled;

    const { confirmationOpen, confirmationTitle } = this.state;

    const label = component.get('label').toLowerCase();

    const canUpdate = this.canUpdate();
    const canArchive = this.canArchive();

    const spacerStyle = { height: spacerHeight };

    const spacerId = component.get('spacerId');

    const cards = this.cards(canUpdate, canArchive);

    const searchString = component.get('searchString');

    // Is the user searching and there are no records?
    const showNoRecords = searchString && noResults;

    const header = this.header(cards.length);

    return (
      <div>
        {header}

        {showNoRecords ? (
          <Typography variant="display1">
            <Icon icon="Info" /> No {label} found
          </Typography>
        ) : null}

        <div id={spacerId} className={classes.spacer} style={spacerStyle} />

        <Grid container spacing={0}>
          {cards}
        </Grid>

        {isLoading ? <div className={classes.footer} /> : null}

        {/* TODO: would it be better to have a single, global FormDialog instance? Or, is it better
        to have multiple instances so that you can have different memory spaces. Currenly we have a
        hybrid where we have a dialog per form. There is almost certainly more overhead in having an
        instance per record, right? */}
        <FormDialog
          component={form}
          currentForm={currentForm}
          onClose={this.handleClose}
          onRead={this.handleRead}
          onSave={this.handleSave}
          onEdit={this.handleEdit}
          onDelete={this.handleDelete}
          forbidUpdate={forbidUpdate || !canUpdate || dis || useDisplayValue}
          forbidDelete={forbidDelete || !canArchive || dis || useDisplayValue}
        />

        <ConfirmationDialog
          open={confirmationOpen}
          onClose={this.handleConfirmationClose}
          title={confirmationTitle}
        />
      </div>
    );
  }

  render() {
    const { component } = this.props;

    return (
      <span>
        <CommonField component={component} inlineLabel="true" />
        {this.field()}
      </span>
    );
  }
}

CollectionField = withStyles(styles)(CollectionField);
CollectionField = attach([
  'change',
  'label',
  'singularLabel',
  'forbidCreate',
  'forbidUpdate',
  'forbidDelete',
  'forbidSort',
  'editable',
  'disabled',
  'spacerHeight',
  'bufferTopId',
  'isLoading',
  'form',
  'currentForm',
  'mode',
  'noResults',
  'store',
  'maxColumns',
  'useDisplayValue'
])(CollectionField);
export default CollectionField;
