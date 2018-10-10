import Roles from './roles';

it('should check if reserved', () => {
  expect(Roles.isReserved(Roles.OWNER)).toEqual(true);
  expect(Roles.isReserved('foo')).toEqual(false);
});

it('should get id', () => {
  expect(Roles.getId(Roles.OWNER)).toEqual(Roles.ID_OWNER);
});
