// TODO: when click on another section, close other sections? Requires moving menu state to app?

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Submenu from './submenu';
import attach from './attach';

const drawerWidth = 240;

const styles = theme => ({
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
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

class Menu extends React.Component {
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
    const { menu } = this.props;
    const items = menu.get('items');
    return items.map((item, index) => (
      <Submenu item={item} key={index} onNavigate={this.handleNavigate} />
    ));
  }

  render() {
    const { classes, theme, mobileOpen } = this.props;

    const drawer = (
      <div>
        <div className={classes.drawerHeader} />
        <Divider />
        {this.items()}
      </div>
    );

    return (
      <div>
        <Hidden mdUp>
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
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </div>
    );
  }
}

Menu = withStyles(styles, { withTheme: true })(Menu);
Menu = attach(['items'], 'menu')(Menu);
export default Menu;
