import ChainedSelectField from './chained-select-field';

const createCarField = () => {
  return new ChainedSelectField({
    name: 'car',
    label: 'Car',
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
    ]
  });
};

it('should set and get', () => {
  const car = createCarField();

  expect(car.getValue()).toBeFalsy();

  // USA - Telsa - Model S - Red
  car.setValue([2, 5, 9, 10]);
  expect(car.getValue()).toEqual([2, 5, 9, 10]);

  // Germany - BMW - i3
  car.setValue([1, 3, 6]);
  expect(car.getValue()).toEqual([1, 3, 6]);

  car.clearValue();
  expect(car.getValue()).toBeFalsy();

  car.setValue([2, 5, 9, 10]);
  expect(car.getValue()).toEqual([2, 5, 9, 10]);
});

it('should adjust options for subsequent fields', () => {
  const car = createCarField();

  // USA - Telsa - Model S - Red
  car.setValue([2, 5, 9, 10]);

  // Switch 1st field to Germany
  car._getField(0).setValue(1);
  expect(car.getValue()).toEqual([1]);
  expect(car._getField(1).get('options')).toEqual([
    { value: 3, label: 'BMW' },
    { value: 4, label: 'Mercedes' }
  ]);
});

it('should clear subsequent fields', () => {
  const car = createCarField();

  // USA - Telsa - Model S - Red
  car.setValue([2, 5, 9, 10]);

  // Clear Telsa value
  car._getField(1).clearValue();
  expect(car.getValue()).toEqual([2]);

  // Make sure the subsequent fields have been hidden
  expect(car._getField(2).get('hidden')).toEqual(true);
  expect(car._getField(3).get('hidden')).toEqual(true);
});

const numNonHiddenFields = fields => {
  let num = 0;
  fields.each(item => {
    if (!item.get('hidden')) {
      num++;
    }
  });
  return num;
};

it('should remove fields when clearing', () => {
  const car = createCarField();

  car.clearValue();
  expect(numNonHiddenFields(car._fields)).toEqual(1);

  car.setValue([2, 5, 9, 10]);

  car.clearValue();
  expect(numNonHiddenFields(car._fields)).toEqual(1);
});

it('should get display value', () => {
  const car = createCarField();
  car.setValue([2, 5, 9, 10]);
  expect(car.getDisplayValue()).toEqual(['USA', 'Tesla', 'Model S', 'Red']);
  car.clearValue();
  expect(car.getDisplayValue()).toEqual(null);
});

it('should clone', () => {
  // Clone when no values and make sure a new field is created
  const car = createCarField();
  const clonedCar = car.clone();
  expect(clonedCar._fields.first()).not.toEqual(car._fields.first());

  // Make sure value is copied after the new fields have been created
  const myCar = [2, 5, 9, 10];
  car.setValue(myCar);
  const clonedCar2 = car.clone();
  expect(car.getValue()).toEqual(myCar);
  expect(clonedCar2.getValue()).toEqual(myCar);
});
