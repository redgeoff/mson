import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Icon from '../icon';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  formControl: {
    // Specify a more appropriate min width so that the field is wide enough to cover most labels
    // minWidth: 120
  },
  flip: {
    transform: 'scaleY(-1)'
  }
});

class SelectOrder extends React.PureComponent {
  handleClick = () => {
    const sortOrder = this.props.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    this.props.onChange({ sortOrder });
  };

  handleChange = event => {
    this.props.onChange({ sortBy: event.target.value });
  };

  render() {
    const { classes, sortBy, sortOrder, options } = this.props;

    const flipped = sortOrder !== 'DESC';

    const items = options.map(option => {
      return (
        <MenuItem value={option.value} key={option.value}>
          {option.label}
        </MenuItem>
      );
    });

    // If we wanted the icon as an adornment:
    // <TextField
    //   select
    //   InputProps={{
    //     startAdornment:
    //     <InputAdornment position="start">
    //       <IconButton color="primary" aria-label="new" onClick={this.handleOrder}>
    //         <Icon icon="Sort" className={classes.flip} />
    //       </IconButton>
    //     </InputAdornment>,
    //   }}
    // >
    //   <MenuItem value={10}>Ten</MenuItem>
    //   <MenuItem value={20}>Twenty</MenuItem>
    //   <MenuItem value={30}>Thirty</MenuItem>
    // </TextField>
    return (
      <div>
        <FormControl className={classes.formControl}>
          {/*
          <InputLabel>Sort by</InputLabel>
          */}
          <Select value={sortBy} onChange={this.handleChange}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {items}
          </Select>
        </FormControl>
        <IconButton
          color="primary"
          aria-label="sort order"
          onClick={this.handleClick}
        >
          <Icon icon="Sort" className={flipped ? classes.flip : null} />
        </IconButton>
      </div>
    );
  }
}

export default withStyles(styles)(SelectOrder);
