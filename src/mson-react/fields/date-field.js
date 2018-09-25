import React from 'react';
import attach from '../attach';
import CommonField from './common-field';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import DateTimePicker from 'material-ui-pickers/DateTimePicker';
import DatePicker from 'material-ui-pickers/DatePicker';
import withStyles from '@material-ui/core/styles/withStyles';
import DisplayValueTypography from './display-value-typography';

const styles = theme => ({
  root: {
    // We need to add a margin as the picker doesn't play well with the Material-UI label
    marginTop: theme.spacing.unit * 2
  }
});

class DateField extends React.PureComponent {
  handleDateChange = date => {
    this.props.component.setValue(date);
  };

  render() {
    const {
      component,
      classes,
      value,
      includeTime,
      editable,
      useDisplayValue
    } = this.props;

    let shrinkLabel = false;

    const Component = includeTime ? DateTimePicker : DatePicker;

    let fld = null;
    if (editable && !useDisplayValue) {
      // The picker doesn't play well with the label from Material-UI so we need to manually shrink
      // the label when there is a value.
      shrinkLabel = !!value;
      fld = (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <span>
            <Component
              value={value}
              onChange={this.handleDateChange}
              clearable
              className={classes.root}
              // format="M/d/YYYY h:m a"
            />
          </span>
        </MuiPickersUtilsProvider>
      );
    } else {
      fld = (
        <DisplayValueTypography>
          {component.getDisplayValue()}
        </DisplayValueTypography>
      );
    }

    return (
      <CommonField component={component} shrinkLabel={shrinkLabel}>
        {fld}
      </CommonField>
    );
  }
}

DateField = withStyles(styles)(DateField);

export default attach(['value', 'includeTime', 'editable', 'useDisplayValue'])(
  DateField
);
