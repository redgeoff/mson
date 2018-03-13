import React from 'react';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import { Typography } from 'material-ui';
import { ExpandLess, ExpandMore } from 'material-ui-icons';
import { withRouter } from 'react-router';
import _ from 'lodash';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4
  },
  primary: {
    color: theme.palette.text.primary
  },
  secondary: {
    color: theme.palette.text.secondary
  },
  selected: {
    fontWeight: 'bold'
  }
});

class Submenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: this.childSelected()
    };
  }

  childSelected() {
    const { item, location } = this.props;

    let childSelected = false;

    _.each(item.items, item => {
      if (location.pathname === item.path) {
        childSelected = true;
        return false; // exit loop
      }
    });

    return childSelected;
  }

  handleClick = item => {
    // Has sub items?
    if (item.items) {
      this.setState({ open: !this.state.open });
    } else {
      // Note: the navigation is handled by the parent as we want to be able to prevent the
      // navigation if say a form is dirty, etc...
      if (this.props.onNavigate) {
        this.props.onNavigate(item);
      }
    }
  }

  items() {
    const { classes, item, location } = this.props;

    return item.items.map((item, index) => {

      const isSelected = location.pathname === item.path;
      let classNames = [classes.secondary];
      if (isSelected) {
        classNames.push(classes.selected);
      }

      return (
        <ListItem button className={classes.nested} key={index}
          onClick={() => this.handleClick(item)}>
          <ListItemText
            disableTypography
            primary={<Typography variant="body1" className={classNames.join(' ')}>{item.label}</Typography>}
          />
        </ListItem>
      )
    });
  }

  render() {
    const { item, classes, location } = this.props;
    const items = item.items ? this.items() : null;

    const isSelected = location.pathname === item.path;
    let classNames = [classes.primary];
    if (isSelected) {
      classNames.push(classes.selected);
    }

    let listItems = null;
    if (items) {
      listItems = (
        <Collapse
          in={this.state.open}
          timeout="auto"
          unmountOnExit
        >
          <List disablePadding>
            {this.items()}
          </List>
        </Collapse>
      );
    }

    return (
      <div>
        <ListItem button onClick={() => this.handleClick(item)}>
          <ListItemText
            disableTypography
            primary={<Typography variant="subheading" className={classNames.join(' ')}>{item.label}</Typography>}
          />
          { items ?
            (this.state.open ? <ExpandLess /> : <ExpandMore />) : null
          }
        </ListItem>
        {listItems}
      </div>
    )
  }
}

export default withRouter(withStyles(styles)(Submenu));
