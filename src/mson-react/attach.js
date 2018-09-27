import React from 'react';
import _ from '../mson/lodash';

// Usage: attach(['prop1', 'prop2', ...], componentOrName)(Component)

const attach = (_watchProps, componentOrName) => {
  return Component => {
    return class extends React.PureComponent {
      wasMounted = false;

      getComponent = props => {
        if (!props) {
          props = this.props;
        }

        if (!componentOrName) {
          return props.component;
        } else if (typeof componentOrName === 'string') {
          return props[componentOrName];
        } else {
          // componentOrName is a component
          return componentOrName;
        }
      };

      constructor(props) {
        super(props);

        // The field props that we want to expose in the state. Remove any names that are in
        // this.props so that we can override those values.
        this.watchProps = _.difference(_watchProps, Object.keys(this.props));

        // These values need to be in the state so that the component is rerendered when they change.
        this.state = this.getComponent().get(this.watchProps);
      }

      handleFieldChange = (name, value) => {
        if (this.watchProps.indexOf(name) !== -1) {
          // Is the component mounted? Prevent a race condition where the handler tries to act the
          // state after the component has been unmounted.
          if (this.wasMounted) {
            this.setState({ [name]: value });
          }
        }
      };

      componentDidUpdate(prevProps) {
        if (this.getComponent() !== this.getComponent(prevProps)) {
          // The component is changing so recreate the listener
          this.removeListener();
          this.addListener();

          // Set the initial state as the component has changed
          this.setInitialState();
        }
      }

      addListener() {
        this.getComponent().on('$change', this.handleFieldChange);
      }

      removeListener() {
        this.getComponent().removeListener('$change', this.handleFieldChange);
      }

      setInitialState() {
        const initialState = this.getComponent().get(this.watchProps);
        this.setState(initialState);
      }

      componentDidMount() {
        // Note: we have to use componentDidMount and not componentWillMount as handleFieldChange
        // can change the state and we aren't allowed to change the state until the component has
        // mounted.

        this.wasMounted = true;

        this.addListener();

        // Update state with any changes that have occured since construction, but before mounting
        this.setInitialState();
      }

      componentWillUnmount() {
        this.removeListener();
        this.wasMounted = false;
      }

      render() {
        return <Component {...this.state} {...this.props} />;
      }
    };
  };
};

export default attach;
