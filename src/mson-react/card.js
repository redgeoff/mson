import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Component from './component';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  paper: {
    margin: theme.spacing.unit,
    padding: theme.spacing.unit * 2
  },
  content: {
    flex: 1 // TODO: needed?
  }
});

class Card extends React.PureComponent {
  render() {
    const { classes, component } = this.props;

    const content = component.get('content');
    const title = component.get('title');

    return (
      <Grid container spacing={0} justify="center">
        <Grid item xs={12} sm={9} md={6} lg={6}>
          <Paper className={classes.paper}>
            <Grid container wrap="nowrap">
              <Grid item className={classes.content}>
                <Typography variant="headline" component="h2">
                  {title}
                </Typography>
                <Component component={content} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Card);
