// TODO:
//   - On mobile when using search bar, display title and search icon. When user clicks icon then
//     hides title and allows for search string to be entered.

import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from './icon';
import Menu from './menu';
import SearchBar from './search-bar';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Component from './component';
// import compiler from '../mson/compiler';
import withRouter from 'react-router/withRouter';
import attach from './attach';
import globals from '../mson/globals';
import Snackbar from './snackbar';
import ConfirmationDialog from './confirmation-dialog';
import MUISwitch from '@material-ui/core/Switch';
// import UserMenu from './user-menu';
import Action from '../mson/actions/action';
import CollectionField from '../mson/fields/collection-field';
import Form from '../mson/form';
import access from '../mson/access';
import registrar from '../mson/compiler/registrar';

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
    position: 'fixed',
    marginLeft: drawerWidth
  },
  appBarResponsive: {
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

    // Disable Chrome's Scroll Anchoring as it causes problems with inifinite scrolling when
    // scrolling up. Specifically, the scroll location is locked after items are prepended to the
    // top of the list before the spacer is resized.
    overflowAnchor: 'none'
  },
  contentResponsive: {
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

class App extends React.PureComponent {
  state = {
    mobileOpen: false,
    menuItem: null,
    snackbarOpen: false,
    snackbarMessage: '',
    confirmationOpen: false,
    nextMenuItem: null,
    showArchivedToggle: false,

    // Note: we need both searchString and globals.searchString as searchString is the controlled
    // value for the text input and globals.searchString is the actual string with which we are
    // searching.
    searchString: '',
    showSearch: false

    // isLoggedIn: false
  };

  form = null;

  path = null;

  constructor(props) {
    super(props);
    this.setGlobalOnNavigate();
  }

  onNavigate = callback => {
    // We don't warn about discarding changes when fullScreen, e.g. a login page
    const menuItem = this.state.menuItem;
    if (
      menuItem &&
      menuItem.content.has('dirty') &&
      menuItem.content.get('dirty') &&
      !menuItem.fullScreen
    ) {
      // Show a confirmation dialog to see if the user wants to continue
      globals.displayConfirmation({
        title: 'Discard changes?',
        callback
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

    // Clear the redirectPath so that back-to-back redirects to the same route are considered
    // unique, e.g. if / routes to /somepage and then the user hits back.
    globals.set({ redirectPath: null });

    history.push(path);
  }

  navigateTo(path) {
    const { menuItem } = this.state;
    const { app } = this.props;
    const menu = app.get('menu');

    // if (path === '/home') {
    //   // Redirect so that user sees the actual path and not /home
    //   history.push(menu.getFirstItem().path);
    // } else
    if (!menuItem || path !== menuItem.path) {
      // if (this.requireAccess(menu.get('roles'))) {
      // The route is changing
      return this.switchContent(menu.getItem(path));
      // }
    }
  }

  handleNavigate = async (menuItem, force) => {
    // Is the next item just an action?
    if (menuItem.content instanceof Action) {
      // Execute the actions
      await menuItem.content.run();
    } else {
      this.props.history.push(menuItem.path);
    }
  };

  handleConfirmationClose = async yes => {
    const { confirmation } = this.props;
    if (confirmation.callback && yes) {
      // Allow/prohibit the route change
      confirmation.callback(yes);
    }
    this.setState({ confirmationOpen: false });
  };

  canArchive() {
    let canArchive = false;
    let canSearch = false;
    if (this.component && this.component instanceof Form) {
      for (const field of this.component.getFields()) {
        if (field instanceof CollectionField) {
          canArchive =
            !field.get('forbidViewArchived') &&
            access.canArchive(field.get('form'));
          canSearch = !field.get('forbidSearch');
        }
      }
    }
    return {
      canArchive,
      canSearch
    };
  }

  emitLoggedOut() {
    globals.set({ redirectAfterLogin: this.props.location.pathname });
    this.props.app.emitLoggedOut();
  }

  requireAccess(roles) {
    const canAccess =
      !roles || (registrar.client && registrar.client.user.hasRole(roles));
    if (!canAccess) {
      this.emitLoggedOut();
    }
    return canAccess;
  }

  switchContent = async menuItem => {
    // Prevent inifinite recursion when menuItem is null by making sure that the menuItem is
    // changing before changing anything, especially the state
    if (menuItem !== this.state.menuItem) {
      if (this.component) {
        // Emit an unload event so that the component can unload any data, etc...
        this.component.emitUnload();
      }

      // Note: menuItem can be null if there is no content on the landing page
      const isAction = menuItem && menuItem.content instanceof Action;

      // Note: menuItem.content can be an action if the user goes directly to a route where the
      // content is an action
      if (menuItem && menuItem.content) {
        const menu = this.props.app.get('menu');
        const parentItem = menu.getParent(menuItem.path);
        if (
          this.requireAccess(menuItem.roles) &&
          (!parentItem || this.requireAccess(parentItem.roles))
        ) {
          if (isAction) {
            // Execute the actions
            await menuItem.content.run();
          } else {
            // Instantiate form
            // this.component = compiler.newComponent(menuItem.content.component);
            this.component = menuItem.content;

            // Emit a load event so that the component can load any initial data, etc...
            this.component.emitLoad();

            const { canArchive, canSearch } = this.canArchive();

            globals.set({ searchString: null });

            // Set showArchived to false whenever we change the route
            this.setState({
              menuItem,
              showArchived: false,
              showArchivedToggle: canArchive,
              searchString: '',
              showSearch: canSearch
            });
          }
        }
      } else {
        this.component = null;
      }
    }
  };

  onLocation = location => {
    globals.set({ path: location.pathname });
  };

  // TODO: move logic to componentDidUpdate
  componentWillUpdate(props) {
    const snackbarMessage = globals.get('snackbarMessage');
    if (snackbarMessage) {
      this.displaySnackbar(snackbarMessage);
      globals.set({ snackbarMessage: null });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.redirectPath &&
      this.props.redirectPath !== prevProps.redirectPath
    ) {
      this.redirect(this.props.redirectPath);
    }

    if (this.props.path !== prevProps.path) {
      this.navigateTo(this.props.path);
    }

    if (this.props.confirmation !== prevProps.confirmation) {
      // Show the popup if any of the confirmation info has changed
      this.setState({ confirmationOpen: true });
    }

    if (this.props.searchString !== prevProps.searchString) {
      // Pass search string down to current component
      const menuItem = this.state.menuItem;
      if (menuItem && menuItem.content.has('searchString')) {
        menuItem.content.set({
          searchString: this.props.searchString
        });
      }
    }
  }

  componentDidMount() {
    // TODO: is this too inefficient in that it cascades a lot of unecessary events? Instead, could:
    // 1. move more logic to app layer so that only cascade when need new window 2. use something
    // like a global scroll listener that the component can use when it is active
    window.addEventListener('scroll', e => {
      if (this.state.menuItem) {
        this.state.menuItem.content.emit('scroll', e);
      }
    });

    // Handle immediate redirects, e.g. if user is not logged in
    if (this.props.redirectPath) {
      this.redirect(this.props.redirectPath);
    }
  }

  componentWillMount() {
    // Allows us to listen to back and forward button clicks
    this.unlisten = this.props.history.listen(this.onLocation);

    Promise.resolve()
      .then(() => {
        if (registrar.client) {
          // Wait for the session to load before loading the initial component so that we can do things
          // like route based on a user's role
          registrar.client.user.awaitSession();
        }
      })
      .then(() => {
        // Load the correct component based on the initial path
        this.onLocation(this.props.location);
      });
  }

  componentWillUnmount() {
    this.unlisten();
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
      menuItem.content.set({ showArchived: event.target.checked });

      // Scroll to the top of the page as otherwise it is confusing to the user as to why they are
      // dumped in some random place within the newly queried data.
      window.scrollTo({
        top: 0
      });
    }
  };

  handleSearchStringChange = event => {
    this.setState({
      searchString: event.target.value
    });
  };

  render() {
    const { classes, app, confirmation, menuAlwaysTemporary } = this.props;
    const {
      mobileOpen,
      menuItem,
      snackbarOpen,
      snackbarMessage,
      confirmationOpen,
      showArchived,
      showArchivedToggle,
      // path,
      searchString,
      showSearch
      // isLoggedIn
    } = this.state;

    const responsive = !menuAlwaysTemporary;

    const menu = app.get('menu');

    // Use the path from the location prop as this.state.path may not be up to date
    const path = this.props.location.pathname;

    const component = this.component ? (
      <Component component={this.component} />
    ) : null;

    // A component must not switch from controlled to uncontrolled so we need to avoid setting
    // checked=undefined
    const showArchivedChecked = showArchived ? true : false;

    let archivedToggle = null;
    if (showArchivedToggle) {
      archivedToggle = (
        <Tooltip title={showArchived ? 'Show Active' : 'Show Deleted'}>
          <MUISwitch
            onChange={this.handleArchivedChange}
            checked={showArchivedChecked}
          />
        </Tooltip>
      );
    }

    let searchBox = null;
    if (showSearch) {
      searchBox = (
        <SearchBar
          className={classes.searchBar}
          searchString={searchString}
          onChange={this.handleSearchStringChange}
        />
      );
    }

    const appBar = (
      <AppBar
        className={
          classes.appBar + (responsive ? ` ${classes.appBarResponsive}` : '')
        }
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.handleDrawerToggle}
            className={responsive ? classes.navIconHide : ''}
          >
            <Icon icon="Menu" />
          </IconButton>
          <Typography variant="title" color="inherit" noWrap>
            {menuItem ? menuItem.label : ''}
          </Typography>

          {archivedToggle}

          {searchBox}

          {/*
          <UserMenu isLoggedIn={isLoggedIn} />
          */}
        </Toolbar>
      </AppBar>
    );

    const menuSidebar = (
      <Menu
        menu={menu}
        onDrawerToggle={this.handleDrawerToggle}
        mobileOpen={mobileOpen}
        onNavigate={this.handleNavigate}
        path={path}
        responsive={responsive}
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
          <main
            className={
              classes.content +
              (responsive ? ` ${classes.contentResponsive}` : '')
            }
            style={fullScreenStyle}
          >
            <Switch>
              {/* Omitting path so that all paths are matched */}
              <Route />
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
              title={confirmation ? confirmation.title : null}
              text={confirmation ? confirmation.text : null}
              alert={confirmation ? confirmation.alert : null}
            />
          </main>
        </div>
      </div>
    );
  }
}

App = withStyles(styles, { withTheme: true })(App);
App = withRouter(App);
App = attach(['menuAlwaysTemporary'], 'app')(App);
App = attach(
  ['path', 'redirectPath', 'snackbarMessage', 'confirmation', 'searchString'],
  globals
)(App);
export default App;
