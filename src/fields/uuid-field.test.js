import UUIDField from './uuid-field';

it('should set UUID', () => {
  const field = new UUIDField();
  expect(field.getValue()).toHaveLength(36);
});
