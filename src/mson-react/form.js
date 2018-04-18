import React from 'react';
import Field from './fields/field';

export default class Form extends React.Component {
  // Enable automatic validation whenever a user changes data. This feature allows the user to see
  // errors in real-time.
  turnOnAutoValidate(form) {
    form.set({ autoValidate: true });
  }

  constructor(props) {
    super(props);
    this.turnOnAutoValidate(props.form);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.form) {
      this.turnOnAutoValidate(nextProps.form);
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
      return (
        <span key={key + '_' + index}>
          <Field field={field} />
        </span>
      );
    });

    if (formTag !== false) {
      return <form onSubmit={this.handleSave}>{flds}</form>;
    } else {
      return flds;
    }
  }
}
