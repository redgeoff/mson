// Used to provide a back reference to the compiler to components without creating circular
// dependencies. TODO: move up a directory as also used for client

// Note: we also use the registrar to access the client and remove a circular dependency between
// mson-core and mson-server. We must do this as there can only be a single instance of
// babel-polyfill. Unfortunately, react-scripts does not allow us to use code from mson-server
// without compiling it as we cannot properly configure babel plugins. (I tried using
// react-app-rewired, but that didn't work)

export default {};
