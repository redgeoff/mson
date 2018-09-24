import ObjectForm from './object-form';

it('should get errs', () => {
  const objectForm = new ObjectForm();
  expect(objectForm.getErrs()).toEqual([]);
});
