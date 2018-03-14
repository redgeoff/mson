import CompositeField from './composite-field';
import TextField from './text-field';
import builder from '../builder';
import fieldTester from './field-tester';

const createField = () => {
  return new CompositeField({
    name: 'fullName',
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ]
  });
};

// Yes, PersonNameField exists but we recreate it to test more functionality
builder.registerComponent('org.proj.PersonNameField', {
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
  Field: builder.getComponent('org.proj.PersonNameField'),
  exampleValue: {
    firstName: 'Frank',
    lastName: 'Sinatra'
  }
});

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
