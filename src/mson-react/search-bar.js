import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui-icons/Search';

// TODO: see https://material-ui-next.com/style/icons/#icons and implement:
// 1. Mouseover to change background color
// 2. Focus to increase width

const styles = theme => ({
  textFieldInput: {
    borderRadius: 3,
    backgroundColor: theme.palette.primary[400],
    fontSize: 16,
    padding: '10px 10px 10px 42px',
    width: 'calc(100%)',
    color: theme.palette.common.white
  },
  searchIcon: {
    position: 'relative',
    top: '7px',
    left: '-210px'
  }
});

function SearchBar(props) {
  const { classes, className } = props;

  return (
    <div className={className}>
      <TextField
        InputProps={{
          disableUnderline: true,
          classes: {
            input: classes.textFieldInput
          }
        }}
      />
      <SearchIcon className={classes.searchIcon} />
    </div>
  );
}

SearchBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchBar);
