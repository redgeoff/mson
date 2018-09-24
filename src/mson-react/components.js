// NOTE: this file should only contain the component registrations

import ButtonField from './fields/button-field';
import BooleanField from './fields/boolean-field';
import Card from './card';
import CompositeField from './fields/composite-field';
import Field from './fields/field';
import Form from './form';
import CollectionField from './fields/collection-field';
import ListField from './fields/list-field';
import ReCAPTCHAField from './fields/re-captcha-field';
import SelectField from './fields/select-field';
import Text from './text';
import TextField from './fields/text-field';

export default {
  ButtonField,
  BooleanField,
  Card,
  ChainedSelectField: CompositeField,
  ChainedSelectListField: ListField,
  CompositeField,
  Field,
  Form,
  CollectionField,
  IdField: TextField,
  IntegerField: TextField,
  ListField,
  NumberField: TextField,
  ReCAPTCHAField,
  SelectField,
  SelectListField: ListField,
  Text,
  TextField,
  TextListField: ListField,
  User: Form
};
