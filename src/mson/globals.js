// NOTE: we don't use redux here as we want a react-independent implementation--yes, we can use
// redux without React, but we don't need all the overhead.

import Component from './component';

class Globals extends Component {
  _onNavigate = null;

  set(props) {
    super.set(props);
    this._setIfUndefined(
      props,
      'redirect',
      'redirectPath',
      'snackbarMessage',
      'appId',
      'confirmation'
    );
  }

  getOne(name) {
    const value = this._getIfAllowed(
      name,
      'redirect',
      'redirectPath',
      'snackbarMessage',
      'appId',
      'confirmation'
    );
    return value === undefined ? super.getOne(name) : value;
  }

  redirect(path) {
    // We need a separate event for redirecting as we want to be able to change the path without
    // triggering the redirect event
    this.set({ redirectPath: path, redirect: path });
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
