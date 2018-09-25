import React from 'react';
import attach from '../attach';
import CommonField from './common-field';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import DateTimePicker from 'material-ui-pickers/DateTimePicker';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    // We need to add a margin as the picker doesn't play well with the Material-UI label
    marginTop: theme.spacing.unit * 2
  }
});

class DateField extends React.PureComponent {
  state = {
    selectedDate: null
  };

  handleDateChange = date => {
    this.props.component.setValue(date);
  };

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    if (value !== prevProps.value) {
      // The picker expects the date to be a Date and not a ISO date string
      this.setState({ selectedDate: value ? new Date(value) : null });
    }
  }

  render() {
    const { component, classes } = this.props;

    const { selectedDate } = this.state;

    // The picker doesn't play well with the label from Material-UI so we need to manually shrink
    // the label when there is a value.
    const shrinkLabel = !!selectedDate;

    return (
      <CommonField component={component} shrinkLabel={shrinkLabel}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <span>
            <DateTimePicker
              value={selectedDate}
              onChange={this.handleDateChange}
              clearable
              className={classes.root}
            />
          </span>
        </MuiPickersUtilsProvider>
      </CommonField>
    );
  }
}

DateField = withStyles(styles)(DateField);

export default attach(['value'])(DateField);
