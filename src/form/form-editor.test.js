import FormEditor from './form-editor';

// Note: this is needed so that FieldEditorForm has a reference to the compiler
import '../compiler';

let editor = null;

beforeEach(() => {
  editor = new FormEditor();
});

const getDefinition = (withIds) => ({
  component: 'Form',
  fields: [
    {
      id: withIds ? '1' : undefined,
      component: 'Text',
      text: '# Foo',
    },
    {
      id: withIds ? '2' : undefined,
      name: 'firstName',
      component: 'TextField',
      label: 'First Name',
    },
    {
      id: withIds ? '3' : undefined,
      name: 'birthday',
      component: 'DateField',
      label: 'Birthday',
    },
  ],
});

const getValues = () => ({
  fields: [
    {
      id: '1',
      componentName: 'Text',
      text: '# Foo',
    },
    {
      id: '2',
      name: 'firstName',
      componentName: 'TextField',
      label: 'First Name',
    },
    {
      id: '3',
      name: 'birthday',
      componentName: 'DateField',
      label: 'Birthday',
    },
  ],
});

it('should set definition', () => {
  editor.set({ definition: getDefinition(true) });
  expect(editor.getValues()).toEqual(getValues());
});

it('should get definition', () => {
  expect(editor.get('definition')).toEqual({ component: 'Form', fields: [] });

  editor.setValues(getValues());
  expect(editor.get('definition')).toEqual(getDefinition());
});
