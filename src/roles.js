class Roles {}

Roles.OWNER = 'owner';
Roles.ID_OWNER = 1;

Roles.RESERVED = {
  [Roles.OWNER]: Roles.ID_OWNER
};

Roles.isReserved = roleName => {
  return Roles.RESERVED[roleName] ? true : false;
};

Roles.getId = roleName => {
  return Roles.RESERVED[roleName];
};

export default Roles;
