import registrar from '../mson/compiler/registrar';

class Access {
  canCreate(form) {
    let canCreate = false;
    const access = form.get('access');
    if (access && access.form && access.form.create) {
      const roles = Array.isArray(access.form.create)
        ? access.form.create
        : [access.form.create];
      canCreate = registrar.client.user.hasRole(roles);
    } else {
      // No roles specified so can create
      canCreate = true;
    }
    return canCreate;
  }
}

export default new Access();
