import React from 'react';
import IconButton from '@material-ui/core/IconButton';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
// import Menu, { MenuItem } from '@material-ui/core/Menu';
// import { ListItemIcon, ListItemText } from '@material-ui/core/List';
import { Edit, Delete, Restore } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
// import { Tooltip } from '@material-ui/core';

export default class FormCardButtons extends React.PureComponent {
  render() {
    const {
      forbidUpdate,
      forbidDelete,
      editable,
      disabled,
      archivedAt,
      onEdit,
      onDelete
    } = this.props;

    // NOTE: using Tooltips below when we have 100 more items leads to a significant latency. In the
    // future, if we wish to support tooltips then we'll probably need to lazy load the tooltip on
    // mouse over.

    let updateButton = null;
    if (!forbidUpdate) {
      // <Tooltip title="Edit">
      updateButton = (
        <IconButton onClick={onEdit}>
          <Edit />
        </IconButton>
      );
      // </Tooltip>
    }

    let deleteButton = null;
    if (!forbidDelete) {
      deleteButton = (
        <IconButton onClick={onDelete}>
          {archivedAt ? <Restore /> : <Delete />}
        </IconButton>
      );
    }

    if (editable && !disabled && (!forbidUpdate || !forbidDelete)) {
      return (
        <Grid item>
          {updateButton}
          {deleteButton}
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
                <Edit />
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
    } else {
      return null;
    }
  }
}
