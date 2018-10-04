import React from 'react';
import CommonField from './common-field';
import Form from '../form';
import attach from '../attach';
import FlexBreak from '../flex-break';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    marginLeft: theme.spacing.unit * 2,

    // The following flex properties are needed so that we can set a margin for all fields in the
    // nested form
    display: 'flex',
    flexFlow: 'wrap'
  }
});

class FormField extends React.PureComponent {
  render() {
    const { component, hideLabel, classes } = this.props;

    const isBlank = component.isBlank();

    const form = component.get('form');

    return (
      <span>
        {!hideLabel && (
          <CommonField
            component={component}
            inlineLabel="true"
            shrinkLabel={!isBlank}
            marginBottom={false}
          />
        )}
        <FlexBreak />
        <span className={classes.root}>
          <Form component={form} formTag={false} />
        </span>
      </span>
    );
  }
}

FormField = withStyles(styles)(FormField);

export default attach([
  'hideLabel',
  'value' // Changes when the value is or isn't blank
])(FormField);
