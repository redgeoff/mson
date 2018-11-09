import FormField from './form-field';
import Form from '../form';
import TextField from './text-field';
import each from 'lodash/each';
import testUtils from '../test-utils';

const createField = () => {
  return new FormField({
    name: 'fullName',
    label: 'Full Name',
    form: new Form({
      fields: [
        new TextField({
          name: 'firstName',
          label: 'First Name',
          required: true
        }),
        new TextField({
          name: 'lastName',
          label: 'Last Name',
          required: true
        })
      ]
    })
  });
};

it('should set and pass through properties', async () => {
  const properties = {
    value: {
      id: null,
      firstName: null,
      lastName: null
    },
    dirty: true,
    disabled: true,
    editable: true,
    touched: true,
    pristine: true
  };

  const field = createField();
  const setSpy = jest.spyOn(field._form, 'set');
  const getSpy = jest.spyOn(field._form, 'get');

  each(properties, (value, prop) => {
    const props = { [prop]: value };
    field.set(props);

    // May be called multiple times via cascade
    // expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith(props);

    expect(field.get(prop)).toEqual(value);

    // May be called multiple times via cascade
    // expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(prop);

    setSpy.mockClear();
    getSpy.mockClear();
  });
});

it('should bubble up events', async () => {
  const properties = ['dirty', 'touched'];

  const field = createField();
  const eventSpy = jest.fn();

  properties.forEach(prop => {
    field.once(prop, eventSpy);

    field.getField('firstName').set({ [prop]: true });

    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(eventSpy).toHaveBeenCalledWith(true);

    eventSpy.mockClear();
  });
});

it('should clear errors for nested form', () => {
  const field = createField();
  field.setValue({
    firstName: null,
    lastName: null
  });
  field.validate();
  expect(field.hasErr()).toBe(true);

  field.clearErr();
  expect(field.hasErr()).toBe(false);
});

it('should report bad types', () => {
  const field = createField();

  testUtils.expectValuesToBeValid(field, [
    {
      firstName: 'Stevie',
      lastName: 'Wonder'
    },
    {}
  ]);

  testUtils.expectValuesToBeInvalid(
    field,
    [['must not be array'], false, 1, 1.0, 'must not be string'],
    [{ error: 'must be an object' }]
  );
});

it('should clean up any previous form', () => {
  const field = createField();

  const form = field.get('form');
  const removeAllListenersSpy = jest.spyOn(form, 'removeAllListeners');
  field.set({
    form: new Form()
  });

  expect(removeAllListenersSpy).toHaveBeenCalledTimes(1);
});

it('should bubble up change in value', async () => {
  const field = createField();
  const form = field.get('form');
  const afterValue = testUtils.once(field, 'value');
  form.getField('firstName').setValue('Jermaine');
  const value = await afterValue;
  expect(value[0].firstName).toEqual('Jermaine');
});

it('should bubble up load events', async () => {
  const field = createField();
  const emitLoadSpy = jest.spyOn(field, 'emitLoad');
  field.emitLoad();
  expect(emitLoadSpy).toHaveBeenCalledTimes(1);
  await field.resolveAfterLoad();
});
