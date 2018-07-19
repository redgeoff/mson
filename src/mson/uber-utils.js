import globals from './globals';

// Utils that are above the component layer
class Utils {
  displayError(text) {
    globals.displayAlert({ title: 'Unexpected Error', text });
  }

  setFormErrorsFromAPIError(err, form) {
    try {
      const message = JSON.parse(err.graphQLErrors[0].message);
      message.error.forEach(err => {
        form.getField(err.field).setErr(err.error);
      });
    } catch (_err) {
      // An error can occur if the message is not a JSON object, e.g. if we don't have access to
      // archive, etc... The caller will still throw the main error. TODO: Is there a better way to
      // handle this? Should all messages be JSON objects? That would probably be too limiting,
      // right?
      this.displayError(err.toString());
    }
  }
}

export default new Utils();
