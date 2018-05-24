// TODO: make the more menu optional

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
// import Menu, { MenuItem } from '@material-ui/core/Menu';
// import { ListItemIcon, ListItemText } from '@material-ui/core/List';
import { ModeEdit, Delete, Restore } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Form from './form';

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

class FormCard extends React.Component {
  // state = {
  //   anchorEl: null
  // };

  // handleMoreClick = event => {
  //   this.setState({ anchorEl: event.currentTarget });
  // };
  //
  // handleMoreClose = () => {
  //   this.setState({ anchorEl: null });
  // };

  handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.form);
    }
  };

  handleEdit = (event, id) => {
    if (this.props.onEdit) {
      this.props.onEdit(event, this.props.form);
    }
    // this.handleMoreClose();
  };

  handleDelete = event => {
    // this.handleMoreClose();
    if (this.props.onDelete) {
      this.props.onDelete(this.props.form);
    }
  };

  render() {
    const {
      classes,
      form,
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      archivedAt
    } = this.props;
    // const { anchorEl } = this.state;

    let buttons = null;
    if (editable && !disabled && (!forbidUpdate || !forbidDelete)) {
      buttons = (
        <Grid item>
          {forbidUpdate ? (
            ''
          ) : (
            <IconButton onClick={event => this.handleEdit(event)}>
              <ModeEdit />
            </IconButton>
          )}
          {forbidDelete ? (
            ''
          ) : (
            <IconButton onClick={event => this.handleDelete(event)}>
              {archivedAt ? <Restore /> : <Delete />}
            </IconButton>
          )}
          {/* TODO: make the more menu optional
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleMoreClose}
          >
            <MenuItem
              className={classes.menuItem}
              onClick={event => this.handleEdit(event)}
            >
              <ListItemIcon className={classes.icon}>
                <ModeEdit />
              </ListItemIcon>
              <ListItemText
                classes={{ primary: classes.primary }}
                inset
                primary="Edit"
              />
            </MenuItem>
            <MenuItem
              className={classes.menuItem}
              onClick={event => this.handleDelete(event)}
            >
              <ListItemIcon className={classes.icon}>
                <Delete />
              </ListItemIcon>
              <ListItemText
                classes={{ primary: classes.primary }}
                inset
                primary="Delete"
              />
            </MenuItem>
          </Menu>
          */}
        </Grid>
      );
    }

    return (
      <div>
        <Paper className={classes.paper}>
          <Grid container wrap="nowrap">
            <Grid
              item
              className={classes.content}
              onClick={event => this.handleClick(event)}
            >
              <Form form={form} formTag={false} />
            </Grid>
            {buttons}
          </Grid>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(FormCard);
