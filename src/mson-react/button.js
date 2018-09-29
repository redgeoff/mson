import React from 'react';
import ButtonMui from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Icon from './icon';

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  marginTop: {
    marginTop: theme.spacing.unit * 3
  }
});

class Button extends React.PureComponent {
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
      icon,
      fullWidth,
      variant,
      marginTop
    } = this.props;

    const className = marginTop !== false ? classes.marginTop : null;

    return (
      <ButtonMui
        className={className}
        type={type}
        color="primary"
        disabled={disabled}
        onClick={this.handleClick}
        fullWidth={fullWidth}
        variant={variant}
      >
        {icon ? <Icon className={classes.leftIcon} icon={icon} /> : null}
        {label}
      </ButtonMui>
    );
  }
}

export default withStyles(styles)(Button);
