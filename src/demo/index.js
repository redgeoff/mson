// Note: babel-polyfill is needed by client for compilation
import 'babel-polyfill';

// import app from './app';
// import mson from '../mson-react';
//
// // Render the app
// mson.render(app);

import React from 'react';
import ReactDOM from 'react-dom';

// import FlexBreak from '../mson-react/flex-break';
// ReactDOM.render(<FlexBreak />, document.getElementById('root'));

// import TextField from '../mson/fields/text-field';
// import TextFieldUI from '../mson-react/fields/text-field';
// const field = new TextField({ name: 'firstName', label: 'First Name' });
// ReactDOM.render(<TextFieldUI field={field} />, document.getElementById('root'));

import Button from '../mson-react/button';
ReactDOM.render(<Button icon="AddCircle" />, document.getElementById('root'));
// ReactDOM.render(<Button icon="Save" />, document.getElementById('root'));
