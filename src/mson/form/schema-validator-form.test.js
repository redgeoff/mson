import SchemaValidatorForm from './schema-validator-form';
import compiler from '../compiler';
import _ from 'lodash';

it('should not mutate values when setting', () => {
  const form = new SchemaValidatorForm();
  form.set({ compiler });

  const values = {
    name: 'firstName',
    component: 'TextField'
  };

  const clonedValues = _.cloneDeep(values);

  form.setValues(values);

  expect(values).toEqual(clonedValues);
});
