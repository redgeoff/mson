import testUtils from '../test-utils';
import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';
import {
  rayFlat,
  ellaFlat,
  stevieFlat,
  sinatraFlat,
  michaelFlat,
  bowieFlat,
  onGetItemElementMock,
  createMockedStore
} from '../infinite-loader.fixtures';

const createForm = () => {
  return new Form({
    fields: [new TextField({ name: 'name', label: 'Name', required: true })]
  });
};

const createField = props => {
  const field = new FormsField({
    form: createForm(),
    ...props
  });

  // Mock as we aren't actually rendering
  field._infiniteLoader._onGetItemElement = onGetItemElementMock;

  return field;
};

const getItems = field => {
  return field._forms.map(form => form.getValues());
};

it('should infinite scroll', async () => {
  const field = createField({
    storeComponent: createMockedStore(),
    itemsPerPage: 2,
    maxBufferPages: 2,
    scrollThreshold: 100
  });

  // Simulate the load event emitted by the UI, which will trigger the initial load
  let changed = testUtils.once(field, 'change');
  field.emitLoad();
  await changed;
  expect(getItems(field)).toEqual([rayFlat, ellaFlat]);

  // Similate load of next page
  changed = testUtils.once(field, 'change');
  await field._infiniteLoader.scroll({ scrollY: 150 });
  await changed;
  expect(getItems(field)).toEqual([rayFlat, ellaFlat, stevieFlat, sinatraFlat]);

  // Load next page and reset buffer
  changed = testUtils.once(field, 'change');
  await field._infiniteLoader.scroll({ scrollY: 350 });
  await changed;
  expect(getItems(field)).toEqual([
    stevieFlat,
    sinatraFlat,
    michaelFlat,
    bowieFlat
  ]);

  // Load previous page and reset buffer
  changed = testUtils.once(field, 'change');
  await field._infiniteLoader.scroll({ scrollY: 150 });
  await changed;
  expect(getItems(field)).toEqual([rayFlat, ellaFlat, stevieFlat, sinatraFlat]);
});
