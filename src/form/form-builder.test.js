import FormBuilder from './form-builder';

// Note: this is needed so that FieldEditorForm has a reference to the compiler
import '../compiler';

let builder = null;

beforeEach(() => {
  builder = new FormBuilder();
});

const getMSON = (withIds) => ({
  component: 'Form',
  fields: [
    {
      id: withIds ? '1' : undefined,
      name: 'firstName',
      component: 'TextField',
      label: 'First Name',
    },
    {
      id: withIds ? '2' : undefined,
      name: 'birthday',
      component: 'DateField',
      label: 'Birthday',
    },
  ],
});

const getValues = () => ({
  form: {
    fields: [
      {
        id: '1',
        name: 'firstName',
        componentName: 'TextField',
        label: 'First Name',
      },
      {
        id: '2',
        name: 'birthday',
        componentName: 'DateField',
        label: 'Birthday',
      },
    ],
  },
});

it('should set mson', () => {
  builder.set({ mson: getMSON(true) });
  expect(builder.getValues()).toEqual(getValues());
});

it('should set mson via value', () => {
  const mson = getMSON(true);
  builder.set({ value: { mson } });
  expect(builder.getValues()).toEqual({ ...getValues(), mson });
});

it('should get mson', () => {
  expect(builder.get('mson')).toEqual({ component: 'Form', fields: [] });

  builder.setValues(getValues());
  expect(builder.get('mson')).toEqual(getMSON());
});
