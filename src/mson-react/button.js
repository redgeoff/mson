import React from 'react';
import ButtonMui from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Icon from '@material-ui/core/Icon';
import _ from 'lodash';

// Note: we use font icons instead of SVG icons as this allows us to support any icon dynamically
// without adding all icons to the JS bundle. The MaterialUI icons are about 54KB which is
// substantially smaller than their SVG counterparts.
//
// import * as Icons from '@material-ui/icons';

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 3
  }
});

class Button extends React.PureComponent {
  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  // Convert to the font icon name so that we can use the SVG Icon names. This allows us to make
  // changes to this logic without changing the calling code.
  toFontIconName(svgIconName) {
    return _.snakeCase(svgIconName);
  }

  render() {
    const {
      classes,
      type,
      disabled,
      label,
      icon,
      fullWidth,
      variant
    } = this.props;

    const iconContents = icon ? this.toFontIconName(icon) : null;

    return (
      <ButtonMui
        className={classes.button}
        type={type}
        color="primary"
        disabled={disabled}
        onClick={this.handleClick}
        fullWidth={fullWidth}
        variant={variant}
      >
        {icon ? <Icon className={classes.leftIcon}>{iconContents}</Icon> : null}
        {label}
      </ButtonMui>
    );
  }
}

export default withStyles(styles)(Button);
