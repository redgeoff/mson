import TextField from './text-field';

export default class JSONField extends TextField {
  _className = 'JSONField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'space',
            component: 'IntegerField'
          }
        ]
      }
    });

    this._setDefaults(props, { multiline: true });
  }

  // Note: formatting the value this way appears to leads to strange errors in the React layer, i.e.
  // "Uncaught Error: A cross-origin error was thrown. React doesn't have access to the actual error
  // object in development. See https://fb.me/react-crossorigin-error for more information.""
  //
  // set(props) {
  //   const clonedProps = Object.assign({}, props);

  //   if (clonedProps.value !== undefined) {
  //     clonedProps.value = JSON.stringify(JSON.parse(clonedProps.value), null, this.get('space'))
  //   }

  //   super.set(clonedProps);
  // }

  _validateJSON(jsonString) {
    let parseErr = null;
    try {
      JSON.parse(jsonString);
    } catch (err) {
      parseErr = err.message;
    }
    return parseErr;
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      const parseErr = this._validateJSON(value);
      if (parseErr !== null) {
        this.setErr(parseErr);
      }
    }
  }
}
