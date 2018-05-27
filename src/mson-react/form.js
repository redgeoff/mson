import React from 'react';
import Field from './fields/field';
import attach from './attach';
import access from '../mson/access';

class Form extends React.Component {
  fieldsCanAccess = null;

  // Enable automatic validation whenever a user changes data. This feature allows the user to see
  // errors in real-time.
  turnOnAutoValidate(form) {
    form.set({ autoValidate: true });
  }

  // TODO: use access operation names instead of modes like new, edit, etc...?
  modeToOperation(mode) {
    switch (mode) {
      case 'new':
        return 'create';
      default:
        // case 'edit':
        return 'update';
    }
  }

  adjustAccess(formAccess) {
    const op = this.modeToOperation(this.props.mode);
    const form = this.props.form;
    this.fieldsCanAccess = access.fieldsCanAccess(op, form);
  }

  constructor(props) {
    super(props);
    this.turnOnAutoValidate(props.form);

    if (props.access) {
      this.adjustAccess(props.access);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.form) {
      this.turnOnAutoValidate(nextProps.form);
    }

    // Is the access changing?
    if (nextProps.access && nextProps.access !== this.props.access) {
      this.adjustAccess(nextProps.access);
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
    const fields = form.get('fields');

    // The form key is needed or else React will not re-render all fields when the field indexes are
    // the same and we switch from route to another.
    const key = form.getKey();

    const flds = fields.map((field, index) => {
      if (
        this.fieldsCanAccess === null ||
        this.fieldsCanAccess[field.get('name')] !== undefined
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
