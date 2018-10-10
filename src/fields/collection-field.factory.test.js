import CollectionField from './collection-field';
import SelectField from './select-field';
import Form from '../form';
import Factory from '../component/factory';
import Set from '../actions/set';
import testUtils from '../test-utils';
import compiler from '../compiler';

it('should set properties in nested form', async () => {
  const options = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' }
  ];

  const field = new CollectionField({
    formFactory: new Factory({
      product: () => {
        return new Form({
          fields: [new SelectField({ name: 'color' })]
        });
      }
    }),
    listeners: [
      {
        event: 'load',
        actions: [
          // Simulate reading options from API call
          new Set({
            value: options
          }),
          new Set({
            name: 'formFactory.properties',
            value: {
              'fields.color.options': '{{arguments}}'
            }
          })
        ]
      }
    ]
  });

  field.emitLoad();
  await field.resolveAfterLoad();
  const form = field.get('formFactory').produce();
  expect(form.getField('color').get('options')).toEqual(options);

  field.setValue([
    {
      color: 'red'
    },
    {
      color: 'blue'
    }
  ]);
  expect(field.getValue()).toEqual([
    {
      ...testUtils.toDefaultFieldsObject(undefined),
      color: 'red'
    },
    {
      ...testUtils.toDefaultFieldsObject(undefined),
      color: 'blue'
    }
  ]);
});

it('should set properties in dynamic nested form', async () => {
  const options = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' }
  ];

  const component = compiler.newComponent({
    component: 'Form',
    fields: [
      {
        name: 'colors',
        label: 'Colors',
        component: 'UserList',
        listeners: [
          {
            event: 'load',
            actions: [
              {
                component: 'Set',
                value: options
              },
              {
                component: 'Set',
                name: 'formFactory.properties',
                value: {
                  'fields.color.options': '{{arguments}}'
                }
              }
            ]
          }
        ],
        baseFormFactory: {
          component: 'Factory',
          product: {
            component: 'Form',
            fields: [
              {
                name: 'color',
                component: 'SelectField'
              }
            ]
          }
        }
      }
    ]
  });

  const field = component.getField('colors');
  field.emitLoad();
  await field.resolveAfterLoad();
  const form = field.get('formFactory').produce();
  expect(form.getField('color').get('options')).toEqual(options);

  field.setValue([
    {
      color: 'red'
    },
    {
      color: 'blue'
    }
  ]);
  expect(field.getValue()).toEqual([
    {
      ...testUtils.toDefaultFieldsObject(undefined),
      color: 'red'
    },
    {
      ...testUtils.toDefaultFieldsObject(undefined),
      color: 'blue'
    }
  ]);
});
