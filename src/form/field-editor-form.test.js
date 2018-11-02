import FieldEditorForm from './field-editor-form';
import compiler from '../compiler';

let form = null;

beforeEach(() => {
  form = new FieldEditorForm();

  form._registrar.compiler = compiler;
});

it('should set, get & clear', () => {
  const values1 = { componentName: 'TextField', name: 'firstName' };

  form.setValues(values1);

  expect(form.getValues()).toMatchObject(values1);

  // Set
  form.setValues({ label: 'First Name' });

  // Get
  expect(form.getValues()).toMatchObject({
    ...values1,
    label: 'First Name'
  });

  // Clear
  form.setValues({ componentName: null });
  expect(form.getValues({ default: false })).toEqual({ componentName: null });
});

it('should preserve values', () => {
  const values = {
    componentName: 'NumberField',
    name: 'age',
    label: 'Age',
    maxValue: 100
  };

  form.setValues(values);

  // Change component
  form.setValues({ componentName: 'TextField' });

  // Make sure values were preserved
  expect(form.getValues()).toMatchObject({
    componentName: 'TextField',
    name: 'age',
    label: 'Age'
  });
});
