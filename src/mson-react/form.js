import React from 'react';
import Field from './fields/field';
import attach from './attach';
import access from '../mson/access';

// Use a PureComponent so that the form is re-rendered when the state/props do not change
class Form extends React.PureComponent {
  state = {
    fieldsCanAccess: null
  };

  // Enable automatic validation whenever a user changes data. This feature allows the user to see
  // errors in real-time.
  turnOnAutoValidate() {
    this.props.form.set({ autoValidate: true });
  }

  calcFieldsCanAccess() {
    const { form, mode } = this.props;
    const canDowngrade = true;
    const fieldsCanAccess = access.fieldsCanAccess(
      // Default to update so that access control has a sensible default
      mode ? mode : 'update',
      form,
      null,
      canDowngrade
    );

    // We need to set the ignoreErrs state as there may be a field that is not accessible that is
    // generating an error.
    for (const field of form.getFields()) {
      const ignoreErrs = fieldsCanAccess[field.get('name')] === undefined;
      field.set({ ignoreErrs });
    }

    return fieldsCanAccess;
  }

  adjustAccess() {
    let fieldsCanAccess = null;

    // Was access specified? We check the form instead of this.props.access as this.props.access may
    // not have been updated yet.
    if (this.props.form.get('access')) {
      fieldsCanAccess = this.calcFieldsCanAccess();
    }

    this.setState({ fieldsCanAccess });
  }

  constructor(props) {
    super(props);
    this.turnOnAutoValidate();

    if (props.access) {
      const fieldsCanAccess = this.calcFieldsCanAccess();
      this.state.fieldsCanAccess = fieldsCanAccess;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { form, access, mode } = this.props;

    // Did the form change?
    if (prevProps.form !== form) {
      this.turnOnAutoValidate();
    }

    // Did the access, more or form change?
    if (
      prevProps.access !== access ||
      prevProps.mode !== mode ||
      prevProps.form !== form
    ) {
      this.adjustAccess();
    }
  }

  handleSave = event => {
    // Stop the form from refreshing the page. We can't rely on the default functionality as there
    // may be form errors that need to stop the form from submitting.
    event.preventDefault();

    // No errors?
    const { form } = this.props;
    form.setTouched(true);
    form.validate();
    if (form.getErrs().length === 0) {
      this.props.form.submit();
    }
  };

  render() {
    const { form, formTag, isLoading } = this.props;
    const { fieldsCanAccess } = this.state;
    const fields = form.get('fields');

    // Hide until the data has finished loading
    if (isLoading) {
      return null;
    }

    // The form key is needed or else React will not re-render all fields when the field indexes are
    // the same and we switch from route to another.
    const key = form.getKey();

    const flds = fields.map((field, index) => {
      if (
        fieldsCanAccess === null ||
        fieldsCanAccess[field.get('name')] !== undefined
      ) {
        let accessEditable = null;
        if (
          fieldsCanAccess !== null &&
          fieldsCanAccess[field.get('name')] === 'read'
        ) {
          accessEditable = false;
        }
        return (
          <Field
            key={key + '_' + index}
            field={field}
            accessEditable={accessEditable}
          />
        );
      } else {
        return null;
      }
    });

    if (formTag !== false) {
      return <form onSubmit={this.handleSave}>{flds}</form>;
    } else {
      return flds;
    }
  }
}

export default attach(['access', 'mode', 'isLoading'], 'form')(Form);
