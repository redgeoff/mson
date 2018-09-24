import testUtils from '../test-utils';
import CollectionField from './collection-field';
import TextField from './text-field';
import Form from '../form';
import Factory from '../component/factory';
import {
  onGetItemElementMock,
  createMockedStore
} from '../infinite-loader.fixtures';

const createForm = () => {
  return new Form({
    fields: [new TextField({ name: 'name', label: 'Name', required: true })]
  });
};

const createField = props => {
  const field = new CollectionField({
    formFactory: new Factory({ product: () => createForm() }),
    ...props
  });

  // Mock as we aren't actually rendering
  field._infiniteLoader._onGetItemElement = onGetItemElementMock;

  return field;
};

let field = null;

beforeEach(async () => {
  field = createField({
    store: createMockedStore()
  });

  // Simulate the load event emitted by the UI, which will trigger the initial load
  let changed = testUtils.once(field, 'change');
  field.emitLoad();
  await changed;
});

it('should change modes', async () => {
  const form = field.get('form');
  const firstForm = field._forms.first();
  const setEditable = jest.spyOn(form, 'setEditable');
  const setCurrentForm = jest.spyOn(field, '_setCurrentForm');

  // Create
  let beginCreate = testUtils.once(form, 'beginCreate');
  let endCreate = testUtils.once(form, 'endCreate');
  field.set({ mode: 'create' });
  await beginCreate;
  expect(setEditable).toHaveBeenCalledTimes(1);
  expect(setEditable).toHaveBeenCalledWith(true);

  // Read
  setEditable.mockClear();
  let beginRead = testUtils.once(form, 'beginRead');
  let endRead = testUtils.once(form, 'endRead');
  field.set({ currentForm: firstForm, mode: 'read' });
  const endCreateArgs = await endCreate;
  expect(endCreateArgs[0]).toEqual('ray');
  const beginReadArgs = await beginRead;
  expect(beginReadArgs[0]).toEqual('ray');
  expect(setEditable).toHaveBeenCalledTimes(1);
  expect(setEditable).toHaveBeenCalledWith(false);
  expect(setCurrentForm).toHaveBeenCalledTimes(1);
  expect(setCurrentForm).toHaveBeenCalledWith(firstForm);

  // Update from read
  setEditable.mockClear();
  let beginUpdate = testUtils.once(form, 'beginUpdate');
  let endUpdate = testUtils.once(form, 'endUpdate');
  field.set({ mode: 'update' });
  const endReadArgs = await endRead;
  expect(endReadArgs[0]).toEqual('ray');
  const beginUpdateArgs = await beginUpdate;
  expect(beginUpdateArgs[0]).toEqual('ray');
  expect(setEditable).toHaveBeenCalledTimes(1);
  expect(setEditable).toHaveBeenCalledWith(true);

  // Save
  await field.save();
  const endUpdateArgs = await endUpdate;
  expect(endUpdateArgs[0]).toEqual('ray');
  // expect(field.get('mode')).toEqual('read');
  expect(field.get('mode')).toBeNull();

  // Transition to no mode
  field.set({ mode: null });

  // Update from no mode
  setEditable.mockClear();
  beginUpdate = testUtils.once(form, 'beginUpdate');
  endUpdate = testUtils.once(form, 'endUpdate');
  field.set({ currentForm: firstForm, mode: 'update' });
  await beginUpdate;
  expect(setEditable).toHaveBeenCalledTimes(1);
  expect(setEditable).toHaveBeenCalledWith(true);
});

it('should set current form', () => {
  const form = field.get('form');
  const firstForm = field._forms.first();
  const clearValues = jest.spyOn(form, 'clearValues');
  const set = jest.spyOn(form, 'set');
  const prepareForm = jest.spyOn(field, '_prepareForm');
  const setTouched = jest.spyOn(form, 'setTouched');
  const clearErrs = jest.spyOn(form, 'clearErrs');
  const setDirty = jest.spyOn(form, 'setDirty');

  // Mock
  const userId = 1;
  const archivedAt = new Date().toISOString();
  firstForm.set({
    value: {
      userId,
      archivedAt
    }
  });

  // currentForm is null
  field._setCurrentForm(null);
  expect(clearValues).toHaveBeenCalledTimes(1);
  expect(prepareForm).toHaveBeenCalledTimes(1);
  expect(setTouched).toHaveBeenCalledTimes(1);
  expect(setTouched).toHaveBeenCalledWith(false);
  expect(clearErrs).toHaveBeenCalledTimes(1);
  expect(setDirty).toHaveBeenCalledTimes(1);
  expect(setDirty).toHaveBeenCalledWith(false);

  // currentForm is not null
  clearValues.mockClear();
  set.mockClear();
  prepareForm.mockClear();
  field._setCurrentForm(firstForm);
  expect(clearValues).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledWith({
    value: firstForm.getValues()
  });
  expect(prepareForm).toHaveBeenCalledTimes(1);

  // currentForm is form
  set.mockClear();
  field.set({ currentForm: firstForm });
  field._setCurrentForm(firstForm);
  expect(set).toHaveBeenCalledWith({
    value: firstForm.getValues()
  });
});
