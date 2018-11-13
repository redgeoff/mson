import FormEditor from './form-editor';

// Note: this is needed so that FieldEditorForm has a reference to the compiler
import '../compiler';

let editor = null;

beforeEach(() => {
  editor = new FormEditor();
});

const definition = {
  component: 'Form',
  fields: [
    {
      component: 'Text',
      text: '# Foo'
    },
    {
      name: 'firstName',
      component: 'TextField',
      label: 'First Name'
    },
    {
      name: 'birthday',
      component: 'DateField',
      label: 'Birthday'
    }
  ]
};

const getValues = withDefaults => ({
  fields: [
    {
      componentName: 'Text',
      text: '# Foo'
    },
    {
      id: withDefaults ? 1 : undefined,
      name: 'firstName',
      componentName: 'TextField',
      label: 'First Name'
    },
    {
      id: withDefaults ? 2 : undefined,
      name: 'birthday',
      componentName: 'DateField',
      label: 'Birthday'
    }
  ]
});

it('should set definition', () => {
  editor.set({ definition });
  expect(editor.getValues()).toEqual(getValues(false));
});

it('should get definition', () => {
  expect(editor.get('definition')).toEqual({ component: 'Form', fields: [] });

  editor.setValues(getValues(true));
  expect(editor.get('definition')).toEqual(definition);
});
