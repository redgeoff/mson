import React from 'react';
import { IconButton, MenuItem, FormControl, Select } from '@material-ui/core';
import { Sort } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  flip: {
    transform: 'scaleY(-1)'
  }
});

class SelectOrder extends React.PureComponent {
  handleClick = () => {
    const sortOrder = this.props.sortOrder === 'asc' ? 'desc' : 'asc';
    this.props.onChange({ sortOrder });
  };

  handleChange = event => {
    this.props.onChange({ sortBy: event.target.value });
  };

  render() {
    const { classes, sortBy, sortOrder } = this.props;

    const flipped = sortOrder === 'desc';

    // If we wanted the icon as an adornment:
    // <TextField
    //   select
    //   InputProps={{
    //     startAdornment:
    //     <InputAdornment position="start">
    //       <IconButton color="primary" aria-label="new" onClick={this.handleOrder}>
    //         <Sort className={classes.flip} />
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
          <Select
            value={sortBy}
            onChange={this.handleChange}
            // inputProps={{
            //   name: 'age',
            //   id: 'age-simple',
            // }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          color="primary"
          aria-label="sort order"
          onClick={this.handleClick}
        >
          <Sort className={flipped ? classes.flip : null} />
        </IconButton>
      </div>
    );
  }
}

export default withStyles(styles)(SelectOrder);
