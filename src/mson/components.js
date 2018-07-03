// NOTE:
// - This file should only contain the component registrations
// - Names of user-defined fields should be in the form org.proj.ComponentName. They should not
//   appear in this file though!

import Action from './actions/action';
import App from './app';
import BooleanField from './fields/boolean-field';
import ButtonField from './fields/button-field';
import Card from './card';
import ChainedSelectField from './fields/chained-select-field';
import ChainedSelectListField from './fields/chained-select-list-field';
import CompositeField from './fields/composite-field';
import CreateRecord from './actions/create-record';
import EmailField from './fields/email-field.json';
import Emit from './actions/emit';
import Field from './fields/field';
import Form from './form';
import FormAccess from './form/form-access';
import FormField from './fields/form-field';
import FormsField from './fields/forms-field';
import FormValidator from './form/form-validator';
import GetRecord from './actions/get-record';
import GetRecords from './actions/get-records';
import IntegerField from './fields/integer-field';
import Iterator from './actions/iterator';
import ListField from './fields/list-field';
import LogInToApp from './actions/log-in-to-app';
import LogOutOfApp from './actions/log-out-of-app';
import Menu from './menu';
import MSONComponent from './component/mson-component';
import NumberField from './fields/number-field';
import ObjectForm from './object-form';
import PasswordField from './fields/password-field.json';
import PersonFullNameField from './fields/person-full-name-field.json';
import PersonNameField from './fields/person-name-field.json';
import RecordEditor from './record-editor/record-editor.json';
import RecordStore from './record-store';
import Redirect from './actions/redirect';
import RolesField from './fields/roles-field';
import SchemaValidatorForm from './form/schema-validator-form';
import SelectField from './fields/select-field';
import SelectListField from './fields/select-list-field';
import Set from './actions/set';
import Snackbar from './actions/snackbar';
import TextField from './fields/text-field';
import TextListField from './fields/text-list-field';
import UpsertRecord from './actions/upsert-record';
import User from './form/user';

export default {
  Action,
  App,
  BooleanField,
  ButtonField,
  Card,
  ChainedSelectField,
  ChainedSelectListField,
  CompositeField,
  CreateRecord,
  EmailField,
  Emit,
  Field,
  Form,
  AccessForm: FormAccess,
  FormField,
  FormsField,
  GetRecord,
  GetRecords,
  IntegerField,
  Iterator,
  ListField,
  LogInToApp,
  LogOutOfApp,
  Menu,
  MSONComponent,
  NumberField,
  ObjectForm,
  PasswordField,
  PersonFullNameField,
  PersonNameField,
  RecordEditor,
  RecordStore,
  Redirect,
  RolesField,
  SchemaValidatorForm,
  SelectField,
  SelectListField,
  Set,
  Snackbar,
  TextField,
  TextListField,
  ValidatorForm: FormValidator,
  UpsertRecord,
  User
};
