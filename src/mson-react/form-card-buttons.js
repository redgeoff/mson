import React from 'react';
import IconButton from '@material-ui/core/IconButton';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/Menu/MenuItem';
// import ListItemIcon from '@material-ui/core/List/ListItemIcon';
// import ListItemText from '@material-ui/core/List/ListItemText';
import Icon from './icon';
import Grid from '@material-ui/core/Grid';
// import Tooltip from '@material-ui/core/Tooltip';

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
          <Icon icon="Edit" />
        </IconButton>
      );
      // </Tooltip>
    }

    let deleteButton = null;
    if (!forbidDelete) {
      deleteButton = (
        <IconButton onClick={onDelete}>
          <Icon icon={archivedAt ? 'Restore' : 'Delete'} />
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
                <Icon icon="Edit" />
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
                <Icon icon="Delete" />
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
