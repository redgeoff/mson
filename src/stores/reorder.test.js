import { Reorder } from './reorder';

let reorder = null;

beforeEach(() => {
  reorder = new Reorder();
});

const onReorder = (item, newOrder) => {
  item.order = newOrder;
};

const getIndex = (items, key) => {
  let index = undefined;
  items.forEach((item, i) => {
    if (item.id === key) {
      index = i;
    }
  });
  return index;
};

it('should create', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 }
  ];

  // Reorder
  const result = reorder.reorder(items, 'e', 2, onReorder);

  // Insert at the destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, { id: 'e', order: 2 });

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'e', order: 2 },
    { id: 'c', order: 3 },
    { id: 'd', order: 4 }
  ]);
});

it('should create when there were race conditions', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 1 },
    { id: 'e', order: 2 },
    { id: 'f', order: 2 }
  ];

  // Reorder
  const result = reorder.reorder(items, 'g', 3, onReorder);

  // Insert at the destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, { id: 'g', order: 3 });

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'g', order: 3 },
    { id: 'd', order: 4 },
    { id: 'e', order: 5 },
    { id: 'f', order: 6 }
  ]);
});

it('should move down', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 },
    { id: 'e', order: 4 }
  ];

  const result = reorder.reorder(items, 'd', 1, onReorder);

  // Move to destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, items[3]);
  items.splice(4, 1);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'd', order: 1 },
    { id: 'b', order: 2 },
    { id: 'c', order: 3 },
    { id: 'e', order: 4 }
  ]);
});

it('should move down when there were race conditions', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 1 },
    { id: 'e', order: 2 },
    { id: 'f', order: 2 }
  ];

  const result = reorder.reorder(items, 'c', 2, onReorder);

  // Move to destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, items[2]);
  items.splice(2, 1);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 },
    { id: 'e', order: 4 },
    { id: 'f', order: 5 }
  ]);
});

it('should move up', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 },
    { id: 'e', order: 4 }
  ];

  const result = reorder.reorder(items, 'b', 3, onReorder);

  // Move to destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, items[1]);
  items.splice(1, 1);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 2 },
    { id: 'b', order: 3 },
    { id: 'e', order: 4 }
  ]);
});

it('should move up when there were race conditions', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 1 },
    { id: 'e', order: 2 },
    { id: 'f', order: 2 }
  ];

  const result = reorder.reorder(items, 'e', 1, onReorder);

  // Move to destination
  const destinationIndex = getIndex(items, result.destinationKey);
  items.splice(destinationIndex, 0, items[4]);
  items.splice(5, 1);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'e', order: 1 },
    { id: 'b', order: 2 },
    { id: 'c', order: 3 },
    { id: 'd', order: 4 },
    { id: 'f', order: 5 }
  ]);
});

it('should archive', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 }
  ];

  // Reorder. Note: we set the newOrder to null so that future reorderings don't require a change to
  // any archived items
  reorder.reorder(items, 'b', null, onReorder);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'b', order: null },
    { id: 'c', order: 1 },
    { id: 'd', order: 2 }
  ]);
});

it('should restore', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 2 },
    { id: 'b', order: null }
  ];

  // Reorder
  reorder.reorder(items, 'b', 1, onReorder);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 },
    { id: 'b', order: 1 }
  ]);
});

it('should delete', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
    { id: 'd', order: 3 }
  ];

  // Delete
  items.splice(1, 1);

  // Reorder
  reorder.reorder(items, null, null, onReorder);

  expect(items).toEqual([
    { id: 'a', order: 0 },
    { id: 'c', order: 1 },
    { id: 'd', order: 2 }
  ]);
});

it('should handle reorder', () => {
  const onReorderSpy = jest.fn().mockImplementation();

  const item = { order: 1 };

  // Order is not changing
  reorder._handleReorder(item, 1, onReorderSpy);
  expect(onReorderSpy).toHaveBeenCalledTimes(0);

  // Order is changing
  reorder._handleReorder(item, 2, onReorderSpy);
  expect(onReorderSpy).toHaveBeenCalledTimes(1);
  expect(onReorderSpy).toHaveBeenCalledWith(item, 2);
});
