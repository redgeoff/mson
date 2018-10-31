import CollectionField from './collection-field';
import TextField from './text-field';
import Form from '../form';
import testUtils from '../test-utils';
import utils from '../utils';
import compiler from '../compiler';
import Emit from '../actions/emit';
import Factory from '../component/factory';

const formName = utils.uuid();

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ],

    // Needed so that parent is populated in fillerProps
    listeners: [
      {
        event: 'foo',
        actions: [
          new Emit({
            event: 'didFoo'
          })
        ]
      }
    ],

    ...props
  });
};

const createField = props => {
  return new CollectionField({
    label: 'People',
    singularLabel: 'Person',
    formFactory: new Factory({
      product: () => createForm()
    }),
    ...props
  });
};

beforeAll(() => {
  compiler.registerComponent(formName, {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      },
      {
        name: 'lastName',
        component: 'TextField'
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent(formName);
});

const shouldAddFormsQuickly = (field, milliseconds, synchronous) => {
  return testUtils.expectToFinishBefore(async () => {
    // Set the parent to simulate usage in the UI as adding the parent can slow cloning
    field.get('form').set({ parent: field });

    // Trigger an action so that the parent is added to the fillerProps as this can also slow down
    // cloning
    const didFoo = testUtils.once(field.get('form'), 'didFoo');
    field.get('form').emitChange('foo');
    await didFoo;

    for (let i = 0; i < 30; i++) {
      const result = field.addForm({
        values: {
          firstName: 'First ' + i,
          lastName: 'Last ' + i
        },
        synchronous
      });
      if (!synchronous) {
        await result;
      }
    }
  }, milliseconds);
};

const ADD_FORMS_COMPILED_TIMEOUT_MS = 300;
it('should add many forms quickly when using compiled components', () => {
  const field = createField();

  return shouldAddFormsQuickly(field, ADD_FORMS_COMPILED_TIMEOUT_MS, true);
});

const shouldAddFormsQuicklyUncompiledComponents = (timeout, synchronous) => {
  const field = compiler.newComponent({
    component: 'CollectionField',
    formFactory: {
      component: 'Factory',
      product: {
        component: formName,
        // Needed so that parent is populated in fillerProps
        listeners: [
          {
            event: 'foo',
            actions: [
              {
                component: 'Emit',
                event: 'didFoo'
              }
            ]
          }
        ]
      }
    }
  });

  return shouldAddFormsQuickly(field, timeout, synchronous);
};

const ADD_FORMS_UNCOMPILED_TIMEOUT_MS = 300;
it('should add many forms quickly when using uncompiled components', () => {
  return shouldAddFormsQuicklyUncompiledComponents(
    ADD_FORMS_UNCOMPILED_TIMEOUT_MS,
    true
  );
});

const ADD_FORMS_UNCOMPILED_ASYNC_TIMEOUT_MS = 800;
it('should add many forms asynchronously & quickly when using uncompiled components', () => {
  return shouldAddFormsQuicklyUncompiledComponents(
    ADD_FORMS_UNCOMPILED_ASYNC_TIMEOUT_MS,
    false
  );
});
