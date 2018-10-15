// NOTE: we don't use redux here as we want a react-independent implementation--yes, we can use
// redux without React, but we don't need all the complexity of redux.

import Component from './component';

export class Globals extends Component {
  _className = 'Globals';

  _onNavigate = null;

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            // The current path. This path is changed whenever the URL changes in the
            // browser bar, including when the user hits the back or forward buttons.
            name: 'path',
            component: 'TextField'
          },
          {
            // A temporary prop used to hold the redirectPath until the redirect is initiated by the
            // UI. This value should be cleared after the redirect is initiated so that back-to-back
            // redirects to the same route are considered unique, e.g. if / routes to /somepage and
            // then the user hits back.
            name: 'redirectPath',
            component: 'TextField'
          },
          {
            name: 'snackbarMessage',
            component: 'TextField'
          },
          {
            name: 'appId',
            component: 'TextField'
          },
          {
            name: 'confirmation',
            component: 'TextField'
          },
          {
            name: 'searchString',
            component: 'TextField'
          },
          {
            name: 'redirectAfterLogin',
            component: 'TextField'
          },
          {
            name: 'reCAPTCHASiteKey',
            component: 'TextField'
          },
          {
            name: 'route',
            component: 'Field'
          }
        ]
      }
    });
  }

  redirect(path) {
    this.set({ redirectPath: path });
  }

  displaySnackbar(message) {
    this.set({ snackbarMessage: message });
  }

  setOnNavigate(onNavigate) {
    this._onNavigate = onNavigate;
  }

  // A hook for ReactRouter's back/forward event handling. This is a bit ugly, but this is what
  // ReactRouter provides us.
  onNavigate(message, callback) {
    if (this._onNavigate) {
      // We don't care about message as we populate is elsewhere
      this._onNavigate(callback);
    }
  }

  displayConfirmation({ title, text, callback, alert }) {
    this.set({ confirmation: { title, text, callback, alert } });
  }

  displayAlert({ title, text, callback }) {
    this.displayConfirmation({ title, text, callback, alert: true });
  }
}

export default new Globals();
