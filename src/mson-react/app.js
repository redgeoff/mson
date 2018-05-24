// TODO:
//   - On mobile when using search bar, display title and search icon. When user clicks icon then
//     hides title and allows for search string to be entered.

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Tooltip } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from './menu';
import SearchBar from './search-bar';
import { Switch, Route } from 'react-router-dom';
import Component from './component';
// import compiler from '../mson/compiler';
import { withRouter } from 'react-router';
import attach from './attach';
import globals from '../mson/globals';
import Snackbar from './snackbar';
import ConfirmationDialog from './confirmation-dialog';
import MUISwitch from '@material-ui/core/Switch';
import UserMenu from './user-menu';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    width: '100%',
    // height: 430,
    // marginTop: theme.spacing.unit * 3,
    zIndex: 1,
    overflow: 'hidden'
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%'
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64
    },

    // Also needed to extend menu vertically
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth
    }
  },
  searchBar: {
    // marginLeft: theme.spacing.unit * 3, // left align
    marginLeft: 'auto' // right align
  }
});

class App extends React.Component {
  state = {
    mobileOpen: false,
    menuItem: null,
    snackbarOpen: false,
    snackbarMessage: '',
    confirmationOpen: false,
    confirmationTitle: '',
    confirmationText: '',
    nextMenuItem: null,
    confirmationCallback: null,
    // isLoggedIn: false
    isLoggedIn: true
  };

  form = null;

  path = null;

  constructor(props) {
    super(props);
    this.createRouteListener();
    this.setGlobalOnNavigate();
  }

  // The RouteListener allows us to load the correct component even when the user hits the back
  // button. The logic is a little ugly, but it allows us to use react-router.
  createRouteListener() {
    let self = this;

    this.routeListener = class extends React.Component {
      lastPath = null;

      onProps(props) {
        // Is the path is changing? This check is needed as otherwise a re-rendering of the
        // RouteListener during some UI operation, e.g. a button click, could result in us
        // redirecting to an outdated path.
        if (
          this.lastPath === null ||
          this.lastPath !== props.location.pathname
        ) {
          this.lastPath = props.location.pathname;
          self.navigateTo(props.location.pathname);
        }
      }

      constructor(props) {
        super(props);
        this.onProps(props);
      }

      componentWillUpdate(props) {
        this.onProps(props);
      }

      render() {
        return null;
      }
    };
  }

  onNavigate = callback => {
    // We don't warn about discarding changes when fullScreen, e.g. a login page
    if (
      this.state.menuItem &&
      this.state.menuItem.content.get('dirty') &&
      !this.state.menuItem.fullScreen
    ) {
      // Show a confirmation dialog to see if the user wants to continue
      this.setState({
        confirmationOpen: true,
        confirmationTitle: 'Discard changes?',
        confirmationText: '',
        confirmationCallback: callback
      });
    } else {
      // Nothing is dirty so allow the navigation to continue
      callback(true);
    }
  };

  setGlobalOnNavigate() {
    globals.setOnNavigate(this.onNavigate);
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  redirect(path) {
    const { history } = this.props;
    history.push(path);
  }

  navigateTo(path) {
    const { menuItem } = this.state;
    const { app, history } = this.props;
    const menu = app.get('menu');

    if (path === '/home') {
      // Redirect so that user sees the actual path and not /home
      history.push(menu.getFirstItem().path);
    } else if (!menuItem || path !== menuItem.path) {
      // The route is changing
      this.switchContent(menu.getItem(path));
    }
  }

  handleNavigate = (menuItem, force) => {
    this.props.history.push(menuItem.path);
  };

  handleConfirmationClose = async yes => {
    if (yes) {
      // Allow/prohibit the route change
      this.state.confirmationCallback(yes);
    }
    this.setState({ confirmationOpen: false });
  };

  switchContent = menuItem => {
    // Prevent inifinite recursion when menuItem is null by making sure that the menuItem is
    // changing before changing anything, especially the state
    if (menuItem !== this.state.menuItem) {
      if (menuItem && menuItem.content) {
        // Instantiate form
        // this.component = compiler.newComponent(menuItem.content.component);
        this.component = menuItem.content;

        // Emit a load event so that the component can load any initial data, etc...
        this.component.emitLoad();
      } else {
        this.component = null;
      }

      // Set showArchived to false whenever we change the route
      this.setState({ menuItem, showArchived: false });
    }
  };

  componentWillUpdate(props) {
    const redirectPath = globals.get('redirectPath');
    if (redirectPath) {
      // We redirect so that the URL in the browser is updated
      this.redirect(redirectPath);

      // Clear as we have initiated the redirection
      globals.set({ redirectPath: null });
    }

    const snackbarMessage = globals.get('snackbarMessage');
    if (snackbarMessage) {
      this.displaySnackbar(snackbarMessage);
      globals.set({ snackbarMessage: null });
    }
  }

  displaySnackbar(message) {
    this.setState({ snackbarOpen: true, snackbarMessage: message });
  }

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  handleArchivedChange = event => {
    this.setState({ showArchived: event.target.checked });

    const { menuItem } = this.state;

    if (menuItem) {
      menuItem.content._emitChange('showArchived', event.target.checked);
    }
  };

  render() {
    const { classes, app } = this.props;
    const {
      mobileOpen,
      menuItem,
      snackbarOpen,
      snackbarMessage,
      confirmationOpen,
      confirmationTitle,
      confirmationText,
      showArchived,
      isLoggedIn
    } = this.state;
    const menu = app.get('menu');

    const component = this.component ? (
      <Component component={this.component} />
    ) : null;

    const RouteListener = this.routeListener;

    // A component must not switch from controlled to uncontrolled so we need to avoid setting
    // checked=undefined
    const showArchivedChecked = showArchived ? true : false;

    const appBar = (
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.handleDrawerToggle}
            className={classes.navIconHide}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit" noWrap>
            {menuItem ? menuItem.label : ''}
          </Typography>

          <Tooltip title={showArchived ? 'Hide Archived' : 'Show Archived'}>
            <MUISwitch
              onChange={this.handleArchivedChange}
              checked={showArchivedChecked}
            />
          </Tooltip>

          {/* TODO: make SearchBar configurable */}
          <SearchBar className={classes.searchBar} />
          <UserMenu isLoggedIn={isLoggedIn} />
        </Toolbar>
      </AppBar>
    );

    const menuSidebar = (
      <Menu
        menu={menu}
        onDrawerToggle={this.handleDrawerToggle}
        mobileOpen={mobileOpen}
        onNavigate={this.handleNavigate}
      />
    );

    let fullScreenStyle = null;
    if (menuItem && menuItem.fullScreen) {
      fullScreenStyle = {
        marginLeft: 0,
        marginTop: 0
      };
    }

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          {menuItem && menuItem.fullScreen ? null : appBar}
          {menuItem && menuItem.fullScreen ? null : menuSidebar}
          <main className={classes.content} style={fullScreenStyle}>
            <Switch>
              {/* Omitting path so that all paths are matched */}
              {/* We cannot use the render property as render functions must be pure functions
                <Route render={this.handleRenderRoute} />
              */}
              <Route component={RouteListener} />
            </Switch>

            {component}

            <Snackbar
              open={snackbarOpen}
              message={snackbarMessage}
              onClose={this.handleSnackbarClose}
            />
            <ConfirmationDialog
              open={confirmationOpen}
              onClose={this.handleConfirmationClose}
              title={confirmationTitle}
              text={confirmationText}
            />
          </main>
        </div>
      </div>
    );
  }
}

App = withStyles(styles, { withTheme: true })(App);
App = withRouter(App);
App = attach(['redirect', 'displaySnackbar'], globals)(App);
export default App;
