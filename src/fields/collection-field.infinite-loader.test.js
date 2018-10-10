import testUtils from '../test-utils';
import CollectionField from './collection-field';
import TextField from './text-field';
import Form from '../form';
import Factory from '../component/factory';
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
  const field = new CollectionField({
    formFactory: new Factory({ product: () => createForm() }),
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
    store: createMockedStore(),
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

  // Remove form
  field.removeForm(rayFlat.id);
  expect(getItems(field)).toEqual([ellaFlat, stevieFlat, sinatraFlat]);
});

it('should resize spacer', () => {
  const field = createField();

  field._window = {
    scrollBy: () => {}
  };

  const setSpy = jest.spyOn(field, 'set');
  const scrollBySpy = jest.spyOn(field._window, 'scrollBy');

  // Shrink
  field._onResizeSpacer(-10);
  expect(setSpy).toHaveBeenCalledTimes(1);
  expect(setSpy).toHaveBeenCalledWith({ spacerHeight: 0 });
  expect(scrollBySpy).toHaveBeenCalledTimes(1);
  expect(scrollBySpy).toHaveBeenCalledWith({ behavior: 'instant', top: 10 });

  // Spacer has negative height
  setSpy.mockReset();
  scrollBySpy.mockReset();
  field._infiniteLoader.beginningLoaded = () => false;
  field._onResizeSpacer(-10);
  expect(setSpy).toHaveBeenCalledTimes(1);
  expect(setSpy).toHaveBeenCalledWith({ spacerHeight: 0 });
  expect(scrollBySpy).toHaveBeenCalledTimes(1);
  expect(scrollBySpy).toHaveBeenCalledWith({ behavior: 'instant', top: 10 });
});

it('should get spacer element', () => {
  const field = createField();

  field._document = {
    getElementById: () => {}
  };

  const getElementByIdSpy = jest.spyOn(field._document, 'getElementById');
  field._infiniteLoader._onGetSpacerElement();
  expect(getElementByIdSpy).toHaveBeenCalledWith(field.get('spacerId'));
});
