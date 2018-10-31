import Form from './form';
import TextField from '../fields/text-field';
import testUtils from '../test-utils';

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({
        name: 'middleName',
        label: 'Middle Name',
        required: true
      }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ],
    ...props
  });
};

const NUM_COMPONENTS = 30;

const CREATE_FORMS_TIMEOUT_MS = 500;
it('should create many forms quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    for (let i = 0; i < NUM_COMPONENTS; i++) {
      createForm();
    }
  }, CREATE_FORMS_TIMEOUT_MS);
});

const CLONE_FORMS_TIMEOUT_MS = 900;
it('should clone many forms quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    const form = createForm();
    for (let i = 0; i < NUM_COMPONENTS; i++) {
      form.clone();
    }
  }, CLONE_FORMS_TIMEOUT_MS);
});
