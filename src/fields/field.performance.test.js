import testUtils from '../test-utils';
import Field from './field';
import Form from '../form';
import compiler from '../compiler';

const NUM_FIELDS = 300;

const CREATE_FIELDS_TIMEOUT_MS = 400;
it('should create many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    for (let i = 0; i < NUM_FIELDS; i++) {
      new Field();
    }
  }, CREATE_FIELDS_TIMEOUT_MS);
});

const CLONE_FIELDS_TIMEOUT_MS = 600;
it('should clone many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    const field = new Field();
    for (let i = 0; i < NUM_FIELDS; i++) {
      field.clone();
    }
  }, CLONE_FIELDS_TIMEOUT_MS);
});

// Note: we explicitly set a timeout on the following test to ensure that it doesn't take too long
// to compile components, particularly because the field schema is for a relatively long form. Once
// upon a time, inefficiencies in cloning data lead to extreme latency when compiling.
const VALIDATE_TIMEOUT_MS = 100;
it('should validate schema', () => {
  return testUtils.expectToFinishBefore(async () => {
    const field = new Field();

    const schemaForm = new Form();
    field.buildSchemaForm(schemaForm, compiler);

    schemaForm.setValues({
      name: 'myField',
      label: 'My Field',
      required: true
      // TODO: ...
    });
    schemaForm.validate();
    expect(schemaForm.hasErr()).toEqual(false);

    schemaForm.setValues({
      name: 'myField',
      foo: 'bar'
    });
    schemaForm.validate();
    expect(schemaForm.hasErr()).toEqual(true);
    expect(schemaForm.getErrs()).toEqual([
      {
        field: 'foo',
        error: 'undefined field'
      }
    ]);
  }, VALIDATE_TIMEOUT_MS);
});
