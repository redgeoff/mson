// Note: this component is now completely defined in JSON. Keep this code as a template.

import React from 'react';
import Form from './form';
import Button from './button';
import { Save, Cancel } from 'material-ui-icons';
import attach from './attach';

class RecordEditor extends React.Component {
  handleSave = (event) => {
    // Stop the form from refreshing the page
    event.preventDefault();

    const { component } = this.props;
    const form = component.get('form');

    // No errors?
    form.setTouched(true);
    form.validate();
    if (form.getErrs().length === 0) {
      component.save();
    }
  }

  handleCancel = () => {
    const { component } = this.props;
    component.cancel();
  }

  render() {
    const { component } = this.props;
    const form = component.get('form');

    const disableSave = form.hasErrorForTouchedField() || !form.get('dirty');

    // We use a form element so that we can submit the form on enter
    return (
      <form onSubmit={this.handleSave}>
        <Form form={form} formTag={false} />

        {/* We use type=submit so that the form is submitted when the user presses enter */}
        <Button type="submit" label="Save" iconComponent={Save} disabled={disableSave} />
        <Button label="Cancel" iconComponent={Cancel} onClick={this.handleCancel} />
      </form>
    )
  }
}

export default attach(['err', 'dirty'], 'component')(RecordEditor)
