import InfiniteLoader from './infinite-loader';

import {
  noop,
  ray,
  ella,
  records1,
  stevie,
  sinatra,
  records2,
  allRecords,
  onGetAllPeople,
  onGetItemElementMock
} from './infinite-loader.fixtures';

const onGetItemMock = id => {
  return allRecords.get(id);
};

const onGetItemCursorMock = item => {
  return item.cursor;
};

const onRemoveItemsMock = (id, n, reverse) => {
  let i = 0;
  let lastId = null;
  for (const entry of allRecords.entries(id, reverse)) {
    lastId = entry[0];
    if (i++ === n) {
      break;
    }
  }
  return lastId;
};

const onGetScrollThresholdMock = () => {
  return 100;
};

const onGetItemsPerPageMock = () => {
  return 2;
};

const onGetMaxBufferPagesMock = () => {
  return 2;
};

const noops = {
  onAddItem: noop,
  onEmitChange: noop,
  onGetAll: noop,
  onResizeSpacer: noop,
  onSetBufferTopId: noop,
  onSetIsLoading: noop
};

it('_getAllDebounced should debounce', async () => {
  const infiniteLoader = new InfiniteLoader(noops);

  const onGetAll = jest.spyOn(infiniteLoader, '_onGetAll');

  // Fresh request
  infiniteLoader._getAllDebounced({ foo: 'bar' });
  expect(onGetAll).toHaveBeenCalledTimes(1);
  expect(onGetAll).toHaveBeenCalledWith({
    after: null,
    before: null,
    foo: 'bar'
  });

  // Should be ignored as a duplicate
  infiniteLoader._getAllDebounced({ foo: 'bar' });
  expect(onGetAll).toHaveBeenCalledTimes(1);

  // New request
  onGetAll.mockReset();
  infiniteLoader._getAllDebounced({ after: 'acursor' });
  expect(onGetAll).toHaveBeenCalledTimes(1);
  expect(onGetAll).toHaveBeenCalledWith({ after: 'acursor', before: null });
});

it('should getAll', async () => {
  const infiniteLoader = new InfiniteLoader(
    Object.assign({}, noops, {
      onGetAll: onGetAllPeople,
      onGetItemsPerPage: onGetItemsPerPageMock
    })
  );

  const onGetAll = jest.spyOn(infiniteLoader, '_onGetAll');
  const onAddItem = jest.spyOn(infiniteLoader, '_onAddItem');
  const onEmitChange = jest.spyOn(infiniteLoader, '_onEmitChange');

  // Get 1st page
  const where = { foo: 'bar' };
  infiniteLoader.setWhere(where);
  await infiniteLoader.getAll();
  expect(infiniteLoader._beginId).toEqual('ray');
  expect(infiniteLoader._beginCursor).toEqual('rayCursor');
  expect(infiniteLoader._endId).toEqual('ella');
  expect(infiniteLoader._endCursor).toEqual('ellaCursor');
  expect(infiniteLoader._bufferSize).toEqual(2);
  expect(infiniteLoader._bufferTopId).toEqual('ray');
  expect(infiniteLoader._bufferTopCursor).toEqual('rayCursor');
  expect(infiniteLoader._bufferBottomId).toEqual('ella');
  expect(infiniteLoader._bufferBottomCursor).toEqual('ellaCursor');
  expect(onGetAll).toHaveBeenCalledTimes(1);
  expect(onGetAll).toHaveBeenCalledWith({
    after: null,
    before: null,
    where,
    first: 2,
    showArchived: false
  });
  expect(onAddItem).toHaveBeenCalledTimes(2);
  expect(onAddItem).toHaveBeenCalledWith(ella, null);
  expect(onAddItem).toHaveBeenCalledWith(ray, null);
  expect(onEmitChange).toHaveBeenCalledTimes(1);
  expect(onEmitChange).toHaveBeenCalledWith(records1);

  // Make sure duplicates are debounced
  await infiniteLoader.getAll();
  expect(onGetAll).toHaveBeenCalledTimes(1);
  expect(onEmitChange).toHaveBeenCalledTimes(1);
  expect(onAddItem).toHaveBeenCalledTimes(2);

  // Get 2nd page
  // onGetAll.mockReset();
  onAddItem.mockReset();
  onEmitChange.mockReset();
  infiniteLoader.setWhere(null);
  await infiniteLoader.getAll({ after: 'ellaCursor' });
  expect(infiniteLoader._beginId).toEqual('stevie');
  expect(infiniteLoader._beginCursor).toEqual('stevieCursor');
  expect(infiniteLoader._endId).toEqual('sinatra');
  expect(infiniteLoader._endCursor).toEqual('sinatraCursor');
  expect(infiniteLoader._bufferSize).toEqual(4);
  expect(infiniteLoader._bufferTopId).toEqual('ray');
  expect(infiniteLoader._bufferTopCursor).toEqual('rayCursor');
  expect(infiniteLoader._bufferBottomId).toEqual('ella');
  expect(infiniteLoader._bufferBottomCursor).toEqual('ellaCursor');
  expect(onGetAll).toHaveBeenCalledTimes(2);
  expect(onGetAll).toHaveBeenCalledWith({
    after: 'ellaCursor',
    before: null,
    first: 2,
    showArchived: false
  });
  expect(onAddItem).toHaveBeenCalledTimes(2);
  expect(onAddItem).toHaveBeenCalledWith(stevie, null);
  expect(onAddItem).toHaveBeenCalledWith(sinatra, null);
  expect(onEmitChange).toHaveBeenCalledTimes(1);
  expect(onEmitChange).toHaveBeenCalledWith(records2);

  // Get 1st page again
  onAddItem.mockReset();
  onEmitChange.mockReset();
  await infiniteLoader.getAll({ before: 'stevieCursor' });
  expect(infiniteLoader._beginId).toEqual('ray');
  expect(infiniteLoader._beginCursor).toEqual('rayCursor');
  expect(infiniteLoader._endId).toEqual('ella');
  expect(infiniteLoader._endCursor).toEqual('ellaCursor');
  expect(infiniteLoader._bufferSize).toEqual(6); // 6 as buffer isn't resized in this test
  expect(infiniteLoader._bufferTopId).toEqual('ray');
  expect(infiniteLoader._bufferTopCursor).toEqual('rayCursor');
  expect(infiniteLoader._bufferBottomId).toEqual('ella');
  expect(infiniteLoader._bufferBottomCursor).toEqual('ellaCursor');
  expect(onGetAll).toHaveBeenCalledTimes(3);
  expect(onGetAll).toHaveBeenCalledWith({
    after: null,
    before: 'stevieCursor',
    last: 2,
    showArchived: false
  });
  expect(onAddItem).toHaveBeenCalledTimes(2);
  expect(onAddItem).toHaveBeenCalledWith(ray, 'ray');
  expect(onAddItem).toHaveBeenCalledWith(ella, 'ray');
  expect(onEmitChange).toHaveBeenCalledTimes(1);
  expect(onEmitChange).toHaveBeenCalledWith(records1);
});

it('should resizeBuffer', async () => {
  const infiniteLoader = new InfiniteLoader(
    Object.assign({}, noops, {
      onGetAll: onGetAllPeople,
      onRemoveItems: onRemoveItemsMock,
      onGetItem: onGetItemMock,
      onGetItemCursor: onGetItemCursorMock,
      onGetItemElement: onGetItemElementMock,
      onGetItemsPerPage: onGetItemsPerPageMock
    })
  );

  const onRemoveItems = jest.spyOn(infiniteLoader, '_onRemoveItems');
  const onGetItem = jest.spyOn(infiniteLoader, '_onGetItem');
  const onResizeSpacer = jest.spyOn(infiniteLoader, '_onResizeSpacer');

  // Resize by removing from the bottom of the buffer
  infiniteLoader._bufferBottomId = 'bowie';
  infiniteLoader._bufferBottomCursor = 'bowieCursor';
  infiniteLoader._resizeBuffer({ previous: true });
  expect(onRemoveItems).toHaveBeenCalledTimes(1);
  expect(onRemoveItems).toHaveBeenCalledWith('bowie', 2, true);
  expect(onGetItem).toHaveBeenCalledTimes(1);
  expect(onGetItem).toHaveBeenCalledWith('sinatra');

  // Resize by removing from the top of the buffer
  infiniteLoader._bufferTopId = 'ray';
  infiniteLoader._bufferTopCursor = 'rayCursor';
  infiniteLoader._resizeBuffer({ previous: false });
  expect(onRemoveItems).toHaveBeenCalledTimes(2);
  expect(onRemoveItems).toHaveBeenCalledWith('ray', 2);
  expect(onGetItem).toHaveBeenCalledTimes(2);
  expect(onGetItem).toHaveBeenCalledWith('stevie');
  expect(onResizeSpacer).toHaveBeenCalledTimes(1);
  expect(onResizeSpacer).toHaveBeenCalledWith(200);
});

it('should getMore', async () => {
  const infiniteLoader = new InfiniteLoader(
    Object.assign({}, noops, {
      onGetAll: onGetAllPeople,
      onGetItemsPerPage: onGetItemsPerPageMock,
      onGetMaxBufferPages: onGetMaxBufferPagesMock
    })
  );

  infiniteLoader._resizeBuffer = noop;

  const resizeBuffer = jest.spyOn(infiniteLoader, '_resizeBuffer');

  // Initial load
  await infiniteLoader.getAll();

  // Get next (2nd) page
  await infiniteLoader._getMore({ previous: false });
  expect(infiniteLoader._bufferBottomId).toEqual('sinatra');
  expect(infiniteLoader._bufferBottomCursor).toEqual('sinatraCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(0);

  // Get next (3rd) page
  await infiniteLoader._getMore({ previous: false });
  expect(infiniteLoader._bufferBottomId).toEqual('bowie');
  expect(infiniteLoader._bufferBottomCursor).toEqual('bowieCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(1);
  expect(resizeBuffer).toHaveBeenCalledWith({ previous: false });

  // Try to get next page (which doesn't exist)
  const onGetAll = jest.spyOn(infiniteLoader, '_onGetAll');
  await infiniteLoader._getMore({ previous: false });
  expect(infiniteLoader._bufferBottomId).toEqual('bowie');
  expect(infiniteLoader._bufferBottomCursor).toEqual('bowieCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(1);
  expect(onGetAll).toHaveBeenCalledTimes(1);

  // Try to get next page again and make sure debounced
  await infiniteLoader._getMore({ previous: false });
  expect(resizeBuffer).toHaveBeenCalledTimes(1);
  expect(onGetAll).toHaveBeenCalledTimes(1);

  // Simulate removal of 1st and 2nd pages
  infiniteLoader._bufferTopId = 'michael';
  infiniteLoader._bufferTopCursor = 'michaelCursor';

  // Get previous (2nd) page
  await infiniteLoader._getMore({ previous: true });
  expect(infiniteLoader._bufferBottomId).toEqual('bowie');
  expect(infiniteLoader._bufferBottomCursor).toEqual('bowieCursor');
  expect(infiniteLoader._bufferTopId).toEqual('stevie');
  expect(infiniteLoader._bufferTopCursor).toEqual('stevieCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(2);

  // Get previous (1st) page
  await infiniteLoader._getMore({ previous: true });
  expect(infiniteLoader._bufferBottomId).toEqual('bowie');
  expect(infiniteLoader._bufferBottomCursor).toEqual('bowieCursor');
  expect(infiniteLoader._bufferTopId).toEqual('ray');
  expect(infiniteLoader._bufferTopCursor).toEqual('rayCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(3);

  // Try to get previous page (which doesn't exist)
  onGetAll.mockReset();
  await infiniteLoader._getMore({ previous: true });
  expect(infiniteLoader._bufferTopId).toEqual('ray');
  expect(infiniteLoader._bufferTopCursor).toEqual('rayCursor');
  expect(resizeBuffer).toHaveBeenCalledTimes(3);
  expect(onGetAll).toHaveBeenCalledTimes(1);

  // Try to get previous page again make sure debounced
  await infiniteLoader._getMore({ previous: true });
  expect(resizeBuffer).toHaveBeenCalledTimes(3);
  expect(onGetAll).toHaveBeenCalledTimes(1);
});

it('should scroll', async () => {
  const infiniteLoader = new InfiniteLoader(
    Object.assign({}, noops, {
      onGetItemElement: onGetItemElementMock,
      onGetScrollThreshold: onGetScrollThresholdMock
    })
  );

  infiniteLoader._getMore = noop;

  const getMore = jest.spyOn(infiniteLoader, '_getMore');

  // Fake state after loading first 2 pages
  infiniteLoader._bufferTopId = 'ray';
  infiniteLoader._bufferTopCursor = 'rayCursor';
  infiniteLoader._firstCursor = 'rayCursor';
  infiniteLoader._bufferBottomId = 'sinatra';

  // Don't get more when scrolling down as not close enough to bottom
  await infiniteLoader.scroll({ scrollY: 250 });
  expect(getMore).toHaveBeenCalledTimes(0);

  // Get more when scrolling down
  await infiniteLoader.scroll({ scrollY: 350 });
  expect(getMore).toHaveBeenCalledTimes(1);
  expect(getMore).toHaveBeenCalledWith({ previous: false });

  // Don't get more when scrolling up because at beginning
  await infiniteLoader.scroll({ scrollY: 325 });
  expect(getMore).toHaveBeenCalledTimes(1);

  // Simulate get more when scrolling down
  infiniteLoader._bufferTopId = 'stevie';
  infiniteLoader._bufferTopCursor = 'stevieCursor';
  infiniteLoader._bufferBottomId = 'bowie';
  infiniteLoader._lastScrollY = 500;

  // Don't get more when scrolling up as not close enough to top and not at beginning
  await infiniteLoader.scroll({ scrollY: 450 });
  expect(getMore).toHaveBeenCalledTimes(1);

  // Get more when scrolling up
  await infiniteLoader.scroll({ scrollY: 150 });
  expect(getMore).toHaveBeenCalledTimes(2);
  expect(getMore).toHaveBeenCalledWith({ previous: true });
});

it('should reset', () => {
  const infiniteLoader = new InfiniteLoader(noops);

  const onResizeSpacer = jest.spyOn(infiniteLoader, '_onResizeSpacer');

  infiniteLoader._bufferTopCursor = 1;
  infiniteLoader._bufferTopId = 1;
  infiniteLoader._bufferBottomCursor = 1;
  infiniteLoader._bufferBottomId = 1;
  infiniteLoader._firstCursor = 1;
  infiniteLoader._lastGetAllProps = 1;
  infiniteLoader._bufferSize = 1;
  infiniteLoader._lastScrollY = 1;

  infiniteLoader.reset();

  expect(infiniteLoader._bufferTopCursor).toBeNull();
  expect(infiniteLoader._bufferTopId).toBeNull();
  expect(infiniteLoader._bufferBottomCursor).toBeNull();
  expect(infiniteLoader._bufferBottomId).toBeNull();
  expect(infiniteLoader._firstCursor).toBeNull();
  expect(infiniteLoader._lastGetAllProps).toBeNull();
  expect(infiniteLoader._bufferSize).toEqual(0);
  expect(infiniteLoader._lastScrollY).toBeNull();
  expect(onResizeSpacer).toHaveBeenCalledTimes(1);
  expect(onResizeSpacer).toHaveBeenCalledWith(null, 0);
});
