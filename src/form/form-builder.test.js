import FormBuilder from './form-builder';

// Note: this is needed so that FieldEditorForm has a reference to the compiler
import '../compiler';

let builder = null;

beforeEach(() => {
  builder = new FormBuilder();
});

const getDefinition = (withIds) => ({
  component: 'Form',
  name: 'FormName',
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

it('should set definition', () => {
  builder.set({ definition: getDefinition(true) });
  expect(builder.getValues()).toEqual(getValues());
});

it('should set definition via value', () => {
  const definition = getDefinition(true);
  builder.set({ value: { definition } });
  expect(builder.getValues()).toEqual(getValues());
});

it('should get definition', () => {
  expect(builder.get('definition')).toEqual({ component: 'Form', fields: [] });

  builder.set({ formName: 'FormName' });
  builder.setValues(getValues());
  expect(builder.get('definition')).toEqual(getDefinition());
});
