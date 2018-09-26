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
      useDisplayValue
      // minDate,
      // maxDate
    } = this.props;

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
              value={value}
              onChange={this.handleDateChange}
              clearable
              className={classes.root}
              // minDate={minDate}
              // maxDate={maxDate}
              onClose={this.handleBlur}
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
  'useDisplayValue'
  // 'minDate',
  // 'maxDate'
])(TimeField);
