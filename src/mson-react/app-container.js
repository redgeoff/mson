import React from 'react';
import AppUI from '../mson-react/app';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blueGrey from '@material-ui/core/colors/blueGrey';
import lightBlue from '@material-ui/core/colors/lightBlue';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import Prompt from 'react-router-dom/Prompt';
import globals from '../mson/globals';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    // primary: blue,
    // type: 'dark',
    // secondary: cyan
    secondary: lightBlue
  },

  // TODO: remove after next major Material-UI release
  // (https://material-ui.com/style/typography/#migration-to-typography-v2)
  typography: {
    useNextVariants: true
  }
});

// Note: BrowserRouter needs to be outside of App so that we can use withRouter
class AppContainer extends React.Component {
  onNavigate = (message, callback) => {
    globals.onNavigate(message, callback);
  };

  render() {
    const { component } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter getUserConfirmation={this.onNavigate}>
          {/* Wrapping div required by BrowserRouter */}
          <div>
            <AppUI component={component} />

            {/* A Prompt is needed to capture back/forward button events with ReactRouter. message
            is required, but the value is arbitrary */}
            <Prompt message="foo" />
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default AppContainer;
