import React from 'react';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '../icon';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

const styles = theme => ({
  input: {
    display: 'flex',
    padding: 0,
    minWidth: 240 // A good default for most labels
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',

    // Adjust for MUI label
    marginTop: theme.spacing.unit * 2 + 5
  },
  chip: {
    margin: `${theme.spacing.unit / 1}px ${theme.spacing.unit / 4}px`
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    )
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
  },
  singleValue: {
    fontSize: theme.typography.subtitle1.fontSize
  },
  // placeholder: {
  //   position: 'absolute',
  //   left: 2,
  //   fontSize: theme.typography.subtitle1.fontSize
  // },
  paper: {
    position: 'absolute',
    zIndex: 1,

    // Adjust for MUI label
    // marginTop: theme.spacing.unit * 7
    marginTop: theme.spacing.unit * 1
  },
  root: {
    // Allow for help icon to be placed on right of field
    display: 'inline-flex'
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    color: theme.palette.text.secondary
  }
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  const optionalProps = {};
  if (props.selectProps.fullWidth) {
    optionalProps.fullWidth = true;
  }
  return (
    <TextField
      {...optionalProps}
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps
        }
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

// Note: kept in case we want to implement the placeholder in the future
// function Placeholder(props) {
//   return (
//     <Typography
//       color="textSecondary"
//       className={props.selectProps.classes.placeholder}
//       {...props.innerProps}
//     >
//       {props.children}
//     </Typography>
//   );
// }

function SingleValue(props) {
  return (
    <Typography
      className={classNames(
        props.selectProps.classes.singleValue,
        props.selectProps.isDisabled ? props.selectProps.classes.disabled : null
      )}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  );
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
        [props.selectProps.classes.disabled]: props.selectProps.isDisabled
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<Icon icon="Cancel" />}
    />
  );
}

function Menu(props) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  // Placeholder,
  SingleValue,
  ValueContainer
};

class AutoCompleteSelect extends React.Component {
  render() {
    const {
      classes,
      options,
      isClearable,
      placeholder,
      onChange,
      onBlur,
      onFocus,
      onInputChange,
      value,
      isDisabled,
      fullWidth,
      isMulti
    } = this.props;

    const selectStyles = {
      dropdownIndicator: base => ({
        ...base,
        cursor: 'pointer'
      }),
      clearIndicator: base => ({
        ...base,
        cursor: 'pointer'
      }),

      // Needed so that the menu appears above any dialog windows
      menuPortal: base => ({
        ...base,
        zIndex: 2000
      })
    };

    return (
      <Select
        className={classNames(classes.root, fullWidth && classes.fullWidth)}
        classes={classes}
        styles={selectStyles}
        options={options}
        components={components}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onInputChange={onInputChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        fullWidth={fullWidth}
        isMulti={isMulti}
        // Needed so that the menu is not clipped by the app's root level overflow:hidden or when it
        // appears in a dialog window
        menuPortalTarget={document.body}
      />
    );
  }
}

export default withStyles(styles)(AutoCompleteSelect);
