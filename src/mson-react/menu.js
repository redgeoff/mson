// TODO: when click on another section, close other sections? Requires moving menu state to app?

import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Submenu from './submenu';
import attach from './attach';
import Typography from '@material-ui/core/Typography';
import registrar from '../mson/compiler/registrar';

const drawerWidth = 240;

const styles = theme => ({
  drawerHeader: {
    ...theme.mixins.toolbar,
    paddingLeft: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit
  },
  drawerPaper: {
    width: 250
  },
  drawPaperResponsive: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      // position: 'relative',
      // height: '100%',

      // Extend to bottom of screen. TODO: does this work on mobile?
      // https://stackoverflow.com/a/48506883/2831606
      position: 'fixed',
      height: '100vh'
    }
  }
});

class Menu extends React.PureComponent {
  handleDrawerToggle = () => {
    if (this.props.onDrawerToggle) {
      this.props.onDrawerToggle();
    }
  };

  handleNavigate = menuItem => {
    if (this.props.onNavigate) {
      this.props.onNavigate(menuItem);
    }
  };

  items() {
    const { component, path } = this.props;
    const items = component.get('items');
    const submenus = [];
    items.forEach((item, index) => {
      // Has access to item?
      if (
        (!item.roles ||
          (registrar.client && registrar.client.user.hasRole(item.roles))) &&
        item.hidden !== true
      ) {
        submenus.push(
          <Submenu
            item={item}
            key={index}
            onNavigate={this.handleNavigate}
            path={path}
            onDrawerToggle={this.handleDrawerToggle}
          />
        );
      }
    });
    return submenus;
  }

  render() {
    const { classes, theme, mobileOpen, responsive /*, roles*/ } = this.props;

    let items = null;
    // if (!roles || (registrar.client && registrar.client.user.hasRole(roles))) {
    items = this.items();
    // }

    const drawer = (
      <div>
        <div className={classes.drawerHeader}>
          <Typography variant="h4">Logo</Typography>
        </div>
        <Divider />
        {items}
      </div>
    );

    const temporaryDrawer = (
      <Drawer
        variant="temporary"
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={mobileOpen}
        classes={{
          paper: classes.drawerPaper
        }}
        onClose={this.handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    );

    const permanentDrawer = (
      <Drawer
        variant="permanent"
        open
        classes={{
          paper:
            classes.drawerPaper +
            (responsive ? ` ${classes.drawPaperResponsive}` : '')
        }}
      >
        {drawer}
      </Drawer>
    );

    if (responsive) {
      return (
        <div>
          <Hidden mdUp>{temporaryDrawer}</Hidden>
          <Hidden smDown implementation="css">
            {permanentDrawer}
          </Hidden>
        </div>
      );
    } else {
      return temporaryDrawer;
    }
  }
}

Menu = withStyles(styles, { withTheme: true })(Menu);
Menu = attach(['items' /*, 'roles'*/])(Menu);
export default Menu;
