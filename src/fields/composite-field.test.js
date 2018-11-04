import CompositeField from './composite-field';
import TextField from './text-field';
import compiler from '../compiler';
import fieldTester from './field-tester';
import testUtils from '../test-utils';
import BooleanField from './boolean-field';

const createField = () => {
  return new CompositeField({
    name: 'fullName',
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ]
  });
};

// Yes, PersonFullNameField exists but we recreate it to test more functionality
compiler.registerComponent('app.PersonFullNameField', {
  component: 'CompositeField',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      component: 'TextField',
      maxLength: 40
    },
    {
      name: 'lastName',
      label: 'Last Name',
      component: 'TextField',
      maxLength: 40
    }
  ]
});

fieldTester.shouldAll({
  Field: compiler.getCompiledComponent('app.PersonFullNameField'),
  exampleValue: {
    firstName: 'Frank',
    lastName: 'Sinatra'
  }
});

compiler.deregisterComponent('app.PersonFullNameField');

it('should rename sub fields', () => {
  const field = createField();

  expect(field.getField('firstName').get('name')).toEqual('firstName');
  expect(field.getField('lastName').get('name')).toEqual('lastName');

  // Rename
  field.set({ name: 'fullNameRenamed' });

  expect(field.getField('firstName').get('name')).toEqual('firstName');
  expect(field.getField('lastName').get('name')).toEqual('lastName');
});

it('should set via sub fields', () => {
  const field = createField();
  field.getField('firstName').setValue('Nina');
  field.getField('lastName').setValue('Simone');
  expect(field.getValue()).toEqual({
    firstName: 'Nina',
    lastName: 'Simone'
  });
});

it('should toggle disable', () => {
  const field = createField();

  field.set({ disabled: true });
  field.eachField(field => expect(field.get('disabled')).toEqual(true));

  field.set({ disabled: false });
  field.eachField(field => expect(field.get('disabled')).toEqual(false));
});

it('should toggle editable', () => {
  const field = createField();

  field.set({ editable: true });
  field.eachField(field => expect(field.get('editable')).toEqual(true));

  field.set({ editable: false });
  field.eachField(field => expect(field.get('editable')).toEqual(false));
});

it('should bubble up touches', async () => {
  const field = createField();

  expect(field.get('touched')).toBeUndefined();

  const afterTouched = testUtils.once(field, 'touched');

  field.getField('firstName').set({ touched: true });
  field.getField('lastName').set({ touched: true });

  await afterTouched;

  // Trigger branch where touched is false
  field.getField('firstName').set({ touched: false });
});

it('should set required', () => {
  const field = createField();

  field.set({ required: true });
  expect(field.get('required')).toEqual(true);
  field.eachField(field => expect(field.get('required')).toEqual(true));

  field.set({ required: false });
  expect(field.get('required')).toEqual(false);
  field.eachField(field => expect(field.get('required')).toEqual(false));
});

it('should set touched', () => {
  const field = createField();

  field.set({ touched: true });
  expect(field.get('touched')).toEqual(true);
  field.eachField(field => expect(field.get('touched')).toEqual(true));

  field.set({ touched: false });
  expect(field.get('touched')).toEqual(false);
  field.eachField(field => expect(field.get('touched')).toEqual(false));
});

it('should set useDisplayValue', () => {
  const field = createField();

  field.set({ useDisplayValue: true });
  expect(field.get('useDisplayValue')).toEqual(true);
  field.eachField(field => expect(field.get('useDisplayValue')).toEqual(true));

  field.set({ useDisplayValue: false });
  expect(field.get('useDisplayValue')).toEqual(false);
  field.eachField(field => expect(field.get('useDisplayValue')).toEqual(false));
});

it('should destroy', () => {
  const field = createField();

  const removeAllListenersSpy = jest.spyOn(field, 'removeAllListeners');
  const fieldSpies = field.mapFields(field => jest.spyOn(field, 'destroy'));

  field.destroy();
  expect(removeAllListenersSpy).toHaveBeenCalledTimes(1);
  expect(fieldSpies).toHaveLength(2);
  fieldSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
});

it('should set parent with initial values', () => {
  const field = new CompositeField({
    name: 'fullName',
    fields: [
      new TextField({ name: 'firstName', value: 'Freddie' }),
      new BooleanField({ name: 'foo' }),
      new BooleanField({ name: 'baz', value: true })
    ]
  });

  expect(field.getValue()).toEqual({
    firstName: 'Freddie',
    baz: true
  });
});
