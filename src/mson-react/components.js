// NOTE: this file should only contain the component registrations

import ButtonField from './fields/button-field';
import CompositeField from './fields/composite-field';
import Field from './fields/field';
import Form from './form';
import FormsField from './fields/forms-field';
import ListField from './fields/list-field';
import RecordEditorOld from './record-editor-old';
import SelectField from './fields/select-field';
import TextField from './fields/text-field';

export default {
  ButtonField,
  ChainedSelectField: CompositeField,
  ChainedSelectListField: ListField,
  CompositeField,
  Field,
  Form,
  FormsField,
  ListField,
  RecordEditorOld,
  SelectField,
  SelectListField: ListField,
  TextField
};
