// NOTE:
// - This file should only contain the component registrations
// - Names of user-defined fields should be in the form org.proj.ComponentName. They should not
//   appear in this file though!

import APIGet from './actions/api-get';
import APISet from './actions/api-set';
import App from './app';
import ButtonField from './fields/button-field';
import Card from './card';
import ChainedSelectField from './fields/chained-select-field';
import ChainedSelectListField from './fields/chained-select-list-field';
import CompositeField from './fields/composite-field';
import EmailField from './fields/email-field.json';
import Emit from './actions/emit';
import Field from './fields/field';
import Form from './form';
import FormAccess from './form/form-access';
import FormField from './fields/form-field';
import FormsField from './fields/forms-field';
import FormValidator from './form/form-validator';
import IntegerField from './fields/integer-field';
import ListField from './fields/list-field';
import Menu from './menu';
import MSONComponent from './component/mson-component';
import NumberField from './fields/number-field';
import ObjectForm from './object-form';
import PasswordField from './fields/password-field.json';
import PersonNameField from './fields/person-name-field.json';
import RecordEditor from './record-editor/record-editor.json';
import RecordEditorOld from './record-editor/record-editor-old';
import RecordEditorWithPreview from './record-editor/record-editor-with-preview.json';
import Redirect from './actions/redirect';
import SchemaValidatorForm from './form/schema-validator-form';
import SelectField from './fields/select-field';
import SelectListField from './fields/select-list-field';
import Set from './actions/set';
import Snackbar from './actions/snackbar';
import TextField from './fields/text-field';
import TextListField from './fields/text-list-field';
import User from './form/user';

export default {
  APIGet,
  APISet,
  App,
  ButtonField,
  Card,
  ChainedSelectField,
  ChainedSelectListField,
  CompositeField,
  EmailField,
  Emit,
  Field,
  Form,
  AccessForm: FormAccess,
  FormField,
  FormsField,
  IntegerField,
  ListField,
  Menu,
  MSONComponent,
  NumberField,
  ObjectForm,
  PasswordField,
  PersonNameField,
  RecordEditor,
  RecordEditorOld,
  RecordEditorWithPreview,
  Redirect,
  SchemaValidatorForm,
  SelectField,
  SelectListField,
  Set,
  Snackbar,
  TextField,
  TextListField,
  ValidatorForm: FormValidator,
  User
};
