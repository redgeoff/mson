import testUtils from '../test-utils';
import Factory from './factory';
import Form from '../form';
import TextField from '../fields/text-field';
import Set from '../actions/set';

const createForm = () => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'middleName' })
    ],
    value: {
      firstName: 'Jack'
    }
  });
};

it('should create factory', () => {
  const factory = new Factory({
    product: () => createForm(),
    properties: {
      fields: [new TextField({ name: 'lastName' })]
    }
  });

  expect(
    factory.produce().getValues({
      ...testUtils.toDefaultFieldsObject(null),
      firstName: 'Jack',
      middleName: 'Hody',
      lastName: 'Johnson'
    })
  );
});

it('should wrap a factory', () => {
  const first = new Factory({
    product: () => {
      return new Form({
        fields: [new TextField({ name: 'firstName' })]
      });
    }
  });

  const middle = new Factory({
    product: () => {
      const form = first.produce();
      form.set({
        fields: [new TextField({ name: 'lastName' })]
      });
      return form;
    }
  });

  let form = middle.produce();
  expect(form.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );

  form.setValues({
    firstName: 'Ada',
    lastName: 'Lovelace'
  });

  const form2 = middle.produce();
  form2.setValues({
    firstName: 'Alan',
    lastName: 'Turing'
  });

  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Alan',
    lastName: 'Turing'
  });
});

it('should set properties for nested component', () => {
  const factory = new Factory({
    product: () => createForm(),
    properties: {
      'fields.middleName.value': 'Hody'
    }
  });

  const form = factory.produce();
  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Jack',
    middleName: 'Hody'
  });
});

it('should set properties for nested component via listener', async () => {
  const factory = new Factory({
    product: () => createForm(),
    listeners: [
      {
        event: 'load',
        actions: [
          new Set({
            value: 'Hody'
          }),
          new Set({
            name: 'properties',
            value: {
              'fields.middleName.value': '{{arguments}}'
            }
          })
        ]
      }
    ]
  });

  factory.emitLoad();
  await factory.resolveAfterLoad();
  const form = factory.produce();
  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Jack',
    middleName: 'Hody'
  });
});
