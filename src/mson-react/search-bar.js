import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import Icon from './icon';
import globals from '../mson/globals';

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

class SearchBar extends React.PureComponent {
  // TODO: move up to App component
  handleKeyUp = event => {
    // Enter pressed?
    if (event.keyCode === 13) {
      globals.set({ searchString: this.props.searchString });
    }
  };

  render() {
    const { classes, className, searchString, onChange } = this.props;

    return (
      <div className={className}>
        <TextField
          InputProps={{
            disableUnderline: true,
            classes: {
              input: classes.textFieldInput
            }
          }}
          value={searchString}
          onKeyUp={this.handleKeyUp}
          onChange={onChange}
        />
        <Icon icon="Search" className={classes.searchIcon} />
      </div>
    );
  }
}

SearchBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchBar);
