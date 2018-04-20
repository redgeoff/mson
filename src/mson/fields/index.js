import builder from '../builder';
import EmailFieldJSON from './email-field.json';
import Field from './field';
import FormField from './form-field';
import FormsField from './forms-field';
import IntegerField from './integer-field';
import ListField from './list-field';
import PersonNameFieldJSON from './person-name-field.json';
import SelectField from './select-field';
import TextField from './text-field';
import _ from 'lodash';

// TODO: is this too inefficient? Does it block the loading thread to build? YUP! How much time is
// actually wasted compiling these components? Is there a better way to compile these core JSON
// components? Should we just create them in JS? For non-core components we can lazy load, but we
// can't really do this for the core components. **Is there a way to build the component in the
// _create() of the component so that it is done on demand**? Benchmarking: took 0-1 milliseconds to
// build EmailField/PersonNameField so maybe the delay is insignificant.
const EmailField = builder.buildComponent('EmailField', EmailFieldJSON);
const PersonNameField = builder.buildComponent(
  'PersonNameField',
  PersonNameFieldJSON
);

// let fields = {
export {
  EmailField,
  Field,
  FormField,
  FormsField,
  IntegerField,
  ListField,
  PersonNameField,
  SelectField,
  TextField
};
