import React from 'react';
import FormLabelMui from '@material-ui/core/FormLabel';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  shrink: {
    ...Object.assign({}, theme.typography.caption, { color: undefined })
  },
  noShrink: {
    ...Object.assign({}, theme.typography.subtitle1, { color: undefined })
  }
});

class FormLabel extends React.PureComponent {
  render() {
    const { children, classes, shrink } = this.props;

    const childProps = Object.assign({}, this.props, {
      shrink: undefined,
      classes: undefined
    });

    const className = shrink ? classes.shrink : classes.noShrink;

    return (
      <FormLabelMui {...childProps} className={className}>
        {children}
      </FormLabelMui>
    );
  }
}

export default withStyles(styles)(FormLabel);
