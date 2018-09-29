import React from 'react';
import attach from '../attach';
import Component from '../component';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    marginLeft: theme.spacing.unit
  }
});

class ComponentField extends React.PureComponent {
  render() {
    const { content, classes } = this.props;

    return (
      <div className={classes.root}>
        <Component component={content} />
      </div>
    );
  }
}

ComponentField = withStyles(styles)(ComponentField);
ComponentField = attach(['content'])(ComponentField);
export default ComponentField;
