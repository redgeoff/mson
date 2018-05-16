import React from 'react';
import ButtonMui from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

// Note: this is a bit wasteful as it bundles all icons, regardless of whether they will be used.
// TODO: is there a better way?
// https://kamranicus.com/posts/2017-09-02-dynamic-import-material-icons-react mentions using the
// webpack API with eager loading, but wouldn't it still require bundling all the icons as the
// icon can be dynamic. Maybe we need a construct that bundles components based on the MSON?
import * as Icons from '@material-ui/icons';

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 3
  }
});

class Button extends React.Component {
  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render() {
    const {
      classes,
      type,
      disabled,
      label,
      iconComponent,
      icon,
      fullWidth,
      variant
    } = this.props;

    // React component must be capitalized to render
    let Icon = null;

    if (iconComponent) {
      Icon = iconComponent;
    } else if (icon) {
      Icon = Icons[icon];
    }

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
        {Icon ? <Icon className={classes.leftIcon} /> : null}
        {label}
      </ButtonMui>
    );
  }
}

export default withStyles(styles)(Button);
