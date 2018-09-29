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
    this.props.component.set({ autoValidate: true });
  }

  calcFieldsCanAccess() {
    const { component, mode } = this.props;
    const canDowngrade = true;
    const fieldsCanAccess = access.fieldsCanAccess(
      // Default to update so that access control has a sensible default
      mode ? mode : 'update',
      component,
      null,
      canDowngrade
    );

    // We need to set the ignoreErrs state as there may be a field that is not accessible that is
    // generating an error.
    for (const field of component.getFields()) {
      const ignoreErrs = fieldsCanAccess[field.get('name')] === undefined;
      field.set({ ignoreErrs });
    }

    return fieldsCanAccess;
  }

  adjustAccess() {
    let fieldsCanAccess = null;

    // Was access specified? We check the form instead of this.props.access as this.props.access may
    // not have been updated yet.
    if (this.props.component.get('access')) {
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
    const { component, access, mode } = this.props;

    // Did the form change?
    if (prevProps.component !== component) {
      this.turnOnAutoValidate();
    }

    // Did the access, more or form change?
    if (
      prevProps.access !== access ||
      prevProps.mode !== mode ||
      prevProps.component !== component
    ) {
      this.adjustAccess();
    }
  }

  handleSave = event => {
    // Stop the form from refreshing the page. We can't rely on the default functionality as there
    // may be form errors that need to stop the form from submitting.
    event.preventDefault();

    // No errors?
    const { component } = this.props;

    // Is the submit action enabled?
    if (!component.get('disableSubmit')) {
      component.setTouched(true);
      component.validate();
      if (component.getErrs().length === 0) {
        component.submit();
      }
    }
  };

  render() {
    const { component, formTag, isLoading } = this.props;
    const { fieldsCanAccess } = this.state;
    const fields = component.get('fields');

    // Hide until the data has finished loading
    if (isLoading) {
      return null;
    }

    // The form key is needed or else React will not re-render all fields when the field indexes are
    // the same and we switch from route to another.
    const key = component.getKey();

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
            component={field}
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

export default attach(['access', 'mode', 'isLoading'])(Form);
