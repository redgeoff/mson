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
  turnOnAutoValidate(form) {
    form.set({ autoValidate: true });
  }

  calcFieldsCanAccess(formAccess, mode) {
    const op = mode;
    const form = this.props.form;
    const fieldsCanAccess = access.fieldsCanAccess(op, form);

    // We need to set the ignoreErrs state as there may be a field that is not accessible that is
    // generating an error.
    for (const field of form.getFields()) {
      const ignoreErrs = fieldsCanAccess[field.get('name')] === undefined;
      field.set({ ignoreErrs });
    }

    return fieldsCanAccess;
  }

  adjustAccess(formAccess, mode) {
    const fieldsCanAccess = this.calcFieldsCanAccess(formAccess, mode);
    this.setState({ fieldsCanAccess });
  }

  constructor(props) {
    super(props);
    this.turnOnAutoValidate(props.form);

    if (props.access) {
      const fieldsCanAccess = this.calcFieldsCanAccess(
        props.access,
        props.mode
      );
      this.state.fieldsCanAccess = fieldsCanAccess;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Did the form change?
    if (prevProps.form !== this.props.form) {
      this.turnOnAutoValidate(this.props.form);
    }

    // Did the access change? Is the mode changing and an access was specified?
    if (
      prevProps.access !== this.props.access ||
      (prevProps.mode !== this.props.mode && this.props.access)
    ) {
      this.adjustAccess(this.props.access, this.props.mode);
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
    const { form, formTag } = this.props;
    const { fieldsCanAccess } = this.state;
    const fields = form.get('fields');

    // The form key is needed or else React will not re-render all fields when the field indexes are
    // the same and we switch from route to another.
    const key = form.getKey();

    const flds = fields.map((field, index) => {
      if (
        fieldsCanAccess === null ||
        fieldsCanAccess[field.get('name')] !== undefined
      ) {
        return <Field key={key + '_' + index} field={field} />;
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

export default attach(['access'], 'form')(Form);
