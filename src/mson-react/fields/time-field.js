import React from 'react';
import attach from '../attach';
import CommonField from './common-field';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import TimePicker from 'material-ui-pickers/TimePicker';
import withStyles from '@material-ui/core/styles/withStyles';
import DisplayValueTypography from './display-value-typography';

const styles = theme => ({
  root: {
    // We need to add a margin as the picker doesn't play well with the Material-UI label
    marginTop: theme.spacing.unit * 2
  }
});

class TimeField extends React.PureComponent {
  handleDateChange = date => {
    this.props.component.setValue(date);
  };

  handleBlur = () => {
    this.props.component.setTouched(true);
  };

  render() {
    const {
      component,
      classes,
      value,
      editable,
      useDisplayValue,
      showSeconds,
      fullWidth,
      disabled,
      accessEditable
    } = this.props;

    const dis = accessEditable === false || disabled;

    let shrinkLabel = false;

    let fld = null;
    if (editable && !useDisplayValue) {
      // The picker doesn't play well with the label from Material-UI so we need to manually shrink
      // the label when there is a value.
      shrinkLabel = !!value;
      fld = (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <span>
            <TimePicker
              // Value cannot be undefined or else picker will default to today
              value={value ? value : null}
              onChange={this.handleDateChange}
              clearable
              className={classes.root}
              seconds={showSeconds}
              // The minDate and maxDate are not used as they are confusing. They impose a
              // restriction on the actual day, which doesn't make sense as the time is store as a
              // timestamp with today's date and therefore the days may not match. Moreover, the
              // picker doesn't change when these dates are specified so we can just handle the
              // validation at the MSON-core layer. TODO: we can implement these ranges in the
              // MSON-core layer by constructing dates with the current day and specified time from
              // minDate and maxDate.
              // minDate={minDate}
              // maxDate={maxDate}

              onClose={this.handleBlur}
              fullWidth={fullWidth}
              disabled={dis}
              invalidDateMessage="" // Let CommonField display the error
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

TimeField = withStyles(styles)(TimeField);

export default attach([
  'value',
  'editable',
  'useDisplayValue',
  'showSeconds',
  'fullWidth',
  'disabled'
])(TimeField);
