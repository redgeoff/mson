// NOTE:
// - This file should only contain the component registrations
// - Names of user-defined fields should be in the form org.proj.ComponentName. They should not
//   appear in this file though!

import Action from './actions/action';
import AddressField from './fields/address-field';
import AddressForm from './fields/address-form';
import AuthenticatedContactUs from './aggregate/authenticated-contact-us';
import App from './app';
import BooleanField from './fields/boolean-field';
import ButtonField from './fields/button-field';
import Card from './card';
import ChainedSelectField from './fields/chained-select-field';
import ChainedSelectListField from './fields/chained-select-list-field';
import CityField from './fields/city-field';
import Component from './component/component';
import CollectionField from './fields/collection-field';
import ComponentField from './fields/component-field';
import CompositeField from './fields/composite-field';
import ConsoleLog from './actions/console-log';
import ContactUs from './aggregate/contact-us';
import CountryField from './fields/country-field';
import DateField from './fields/date-field';
import Email from './actions/email';
import EmailField from './fields/email-field';
import Emit from './actions/emit';
import Factory from './component/factory';
import Field from './fields/field';
import FirebaseStore from './stores/firebase-store';
import Form from './form';
import FormAccess from './form/form-access';
import FormField from './fields/form-field';
import FormValidator from './form/form-validator';
import GetDoc from './actions/get-doc';
import GetDocs from './actions/get-docs';
import IdField from './fields/id-field';
import IntegerField from './fields/integer-field';
import Iterator from './actions/iterator';
import ListField from './fields/list-field';
import LocalStorageStore from './stores/local-storage-store';
import Login from './aggregate/login';
import LogInToApp from './actions/log-in-to-app';
import LogInToAppAndRedirect from './actions/log-in-to-app-and-redirect';
import LogOutOfApp from './actions/log-out-of-app';
import MemoryStore from './stores/memory-store';
import Menu from './menu';
import MoneyField from './fields/money-field';
import MSONComponent from './component/mson-component';
import NumberField from './fields/number-field';
import ObjectForm from './object-form';
import PasswordField from './fields/password-field';
import PersonFullNameField from './fields/person-full-name-field';
import PersonNameField from './fields/person-name-field';
import PhoneField from './fields/phone-field';
import PostalCodeField from './fields/postal-code-field';
import ProvinceField from './fields/province-field';
import ReCAPTCHAField from './fields/re-captcha-field';
import ReCAPTCHAVault from './vaults/re-captcha-vault';
import RecordEditor from './aggregate/record-editor';
import RecordList from './aggregate/record-list';
import RecordStore from './stores/record-store';
import RecoverPassword from './aggregate/recover-password';
import Redirect from './actions/redirect';
import RedirectByRole from './actions/redirect-by-role';
import RegExpField from './fields/reg-exp-field';
import RequestPasswordReset from './actions/request-password-reset';
import ResetPassword from './actions/reset-password';
import RolesField from './fields/roles-field';
import SchemaValidatorForm from './form/schema-validator-form';
import SelectField from './fields/select-field';
import SelectListField from './fields/select-list-field';
import SetFromDoc from './actions/set-from-doc';
import Set from './actions/set';
import SignupEditor from './aggregate/signup-editor';
import Snackbar from './actions/snackbar';
import StateField from './fields/state-field';
import Text from './text';
import TextField from './fields/text-field';
import TextListField from './fields/text-list-field';
import TimeField from './fields/time-field';
import UpdatePasswordEditor from './aggregate/update-password-editor';
import UpdatePassword from './aggregate/update-password';
import UpsertDoc from './actions/upsert-doc';
import URLField from './fields/url-field';
import User from './form/user';
import UserList from './aggregate/user-list';
import Vault from './vaults/vault';
import WhereField from './fields/where-field';
import WrappedComponent from './component/wrapped-component';

export default {
  AccessForm: FormAccess,
  Action,
  AddressField,
  AddressForm,
  AuthenticatedContactUs,
  App,
  BooleanField,
  ButtonField,
  Card,
  ChainedSelectField,
  ChainedSelectListField,
  CityField,
  CollectionField,
  Component,
  ComponentField,
  CompositeField,
  ConsoleLog,
  ContactUs,
  CountryField,
  DateField,
  Email,
  EmailField,
  Emit,
  Factory,
  Field,
  FirebaseStore,
  Form,
  FormField,
  GetDoc,
  GetDocs,
  IdField,
  IntegerField,
  Iterator,
  ListField,
  LocalStorageStore,
  Login,
  LogInToApp,
  LogInToAppAndRedirect,
  LogOutOfApp,
  MemoryStore,
  Menu,
  MoneyField,
  MSONComponent,
  NumberField,
  ObjectForm,
  PasswordField,
  PersonFullNameField,
  PersonNameField,
  PhoneField,
  PostalCodeField,
  ProvinceField,
  ReCAPTCHAField,
  ReCAPTCHAVault,
  RecordEditor,
  RecordList,
  RecordStore,
  RecoverPassword,
  Redirect,
  RedirectByRole,
  RegExpField,
  RequestPasswordReset,
  ResetPassword,
  RolesField,
  SchemaValidatorForm,
  SelectField,
  SelectListField,
  SetFromDoc,
  Set,
  SignupEditor,
  Snackbar,
  StateField,
  Text,
  TextField,
  TextListField,
  TimeField,
  ValidatorForm: FormValidator,
  UpdatePasswordEditor,
  UpdatePassword,
  UpsertDoc,
  URLField,
  User,
  UserList,
  Vault,
  WhereField,
  WrappedComponent
};
