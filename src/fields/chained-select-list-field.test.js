import ChainedSelectListField from './chained-select-list-field';

const createCarsField = props => {
  return new ChainedSelectListField({
    name: 'cars',
    label: 'Cars',
    required: true,
    blankString: 'None',
    // block: true,
    // fullWidth: true,
    options: [
      { value: 1, parentValue: null, label: 'Germany' },
      { value: 2, parentValue: null, label: 'USA' },

      { value: 3, parentValue: 1, label: 'BMW' },
      { value: 4, parentValue: 1, label: 'Mercedes' },

      { value: 5, parentValue: 2, label: 'Tesla' },

      { value: 6, parentValue: 3, label: 'i3' },
      { value: 7, parentValue: 3, label: 'i8' },
      { value: 8, parentValue: 4, label: 'S-Class' },

      { value: 9, parentValue: 5, label: 'Model S' },

      { value: 10, parentValue: 9, label: 'Red' },
      { value: 11, parentValue: 9, label: 'Blue' }
    ],
    ...props
  });
};

it('should set and get', () => {
  const cars = createCarsField();

  cars.clearValue();
  expect(cars.getValue()).toBe(null);

  // USA - Telsa - Model S - Red
  // Germany - BMW - i3
  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);
  expect(cars.getValue()).toEqual([[2, 5, 9, 10], [1, 3, 6]]);

  // Germany - BMW - i8
  cars.setValue([[1, 3, 7]]);
  expect(cars.getValue()).toEqual([[1, 3, 7]]);

  cars.clearValue();
  expect(cars.getValue()).toBe(null);
});

it('should remove fields when clearing', () => {
  const cars = createCarsField();

  cars.clearValue();
  expect(cars._fields.length()).toEqual(1);

  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);

  cars.clearValue();
  expect(cars._fields.length()).toEqual(1);
});

it('should add field when option selected', () => {
  const cars = createCarsField();

  cars._getField(0).setValue([2]);
  expect(cars._fields.length()).toEqual(2);

  cars.clearValue();

  // Simulate user selecting 1st option -- this exposed a bug at one point
  cars
    ._getField(0)
    ._getField(0)
    .setValue(2);

  expect(cars._fields.length()).toEqual(2);
});

it('should not create more than max size fields', () => {
  const cars = createCarsField({ maxSize: 2 });
  cars._getField(0).setValue([2, 5, 9, 10]);
  cars._getField(1).setValue([1, 3, 6]);
  expect(cars._fields.length()).toEqual(2);
});

it('should not add a field when a field is deleted and not reached max size', () => {
  const cars = createCarsField();
  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);
  expect(cars._fields.length()).toEqual(3);
  cars._getField(0).emit('delete');
  expect(cars._fields.length()).toEqual(2);
});

it('should add a field when a field is deleted and reached max size', () => {
  const cars = createCarsField({ maxSize: 2 });
  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);
  expect(cars._fields.length()).toEqual(2);
  cars._getField(0).emit('delete');
  expect(cars._fields.length()).toEqual(2);

  // TODO: also test when delete last item
});

it('should allow last field to be deleted if reached max size', () => {
  const cars = createCarsField({ maxSize: 2 });

  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);
  expect(cars._getField(1).isBlank()).toEqual(false);

  cars.clearValue();
  cars
    ._getField(0)
    ._getField(0)
    .setValue(2); // select 1st option
  cars
    ._getField(3)
    ._getField(0)
    .setValue(1); // select 2nd option
  expect(cars._getField(3).isBlank()).toEqual(false);
});

it('should clone', () => {
  // Clone when no values and make sure a new field is created
  const cars = createCarsField();
  const clonedCars = cars.clone();
  expect(clonedCars._fields.first()).not.toEqual(cars._fields.first());

  // Make sure value is copied after the new fields have been created
  const myCars = [[2, 5, 9, 10], [1, 3, 6]];
  cars.setValue(myCars);
  const clonedCars2 = cars.clone();
  expect(cars.getValue()).toEqual(myCars);
  expect(clonedCars2.getValue()).toEqual(myCars);
});

it('should not report error after valid set', () => {
  const cars = createCarsField();

  // USA - Telsa - Model S - Red
  // Germany - BMW - i3
  cars.setValue([[2, 5, 9, 10], [1, 3, 6]]);

  cars.validate();
  expect(cars.hasErr()).toEqual(false);
});
