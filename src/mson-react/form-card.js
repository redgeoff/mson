import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Form from './form';
import attach from './attach';
import FormCardButtons from './form-card-buttons';

const styles = theme => ({
  paper: {
    margin: theme.spacing.unit,
    padding: theme.spacing.unit * 2
  },
  content: {
    flex: 1,
    cursor: 'pointer'
  }
});

// Use PureComponent so that we avoid unnecessary re-rendering
class FormCard extends React.PureComponent {
  handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.component);
    }
  };

  handleEdit = (event, id) => {
    if (this.props.onEdit) {
      this.props.onEdit(event, this.props.component);
    }
  };

  handleDelete = event => {
    // this.handleMoreClose();
    if (this.props.onDelete) {
      this.props.onDelete(this.props.component);
    }
  };

  render() {
    const {
      classes,
      component,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      value
    } = this.props;

    return (
      <div>
        <Paper className={classes.paper}>
          <Grid container wrap="nowrap">
            <Grid
              item
              className={classes.content}
              onClick={event => this.handleClick(event)}
            >
              <Form component={component} formTag={false} mode="read" />
            </Grid>
            <FormCardButtons
              forbidUpdate={forbidUpdate}
              forbidDelete={forbidDelete}
              editable={editable}
              disabled={disabled}
              archivedAt={value.archivedAt}
              onEdit={event => this.handleEdit(event)}
              onDelete={event => this.handleDelete(event)}
            />
          </Grid>
        </Paper>
      </div>
    );
  }
}

FormCard = withStyles(styles)(FormCard);
export default attach(['value'])(FormCard);
