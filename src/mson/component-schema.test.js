import ComponentSchema from './component-schema';
import Component from './component';

const schemas = [
  {
    component: 'Form',
    fields: [
      {
        name: 'thing1',
        component: 'TextField'
      }
    ]
  },
  {
    component: 'Form',
    fields: [
      {
        name: 'thing2',
        component: 'TextField'
      }
    ]
  },
  {
    component: 'Form',
    fields: [
      {
        name: 'thing3',
        component: 'TextField'
      }
    ]
  }
];

it('should get schema form', () => {
  const componentSchema = new ComponentSchema();
  const component = new Component({
    schema: schemas[0]
  });
  component.set({ schema: schemas[1] });
  component.set({ schema: schemas[2] });
  const form = componentSchema.getSchemaForm(component);
  expect(form.mapFields(field => field.get('name'))).toEqual([
    'id', // from Form
    'name', // from Component
    'thing1',
    'thing2',
    'thing3'
  ]);
});
