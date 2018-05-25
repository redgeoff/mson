import registrar from '../mson/compiler/registrar';

class Access {
  canAccess(operation, form) {
    let canAccess = false;
    const access = form.get('access');
    if (access && access.form && access.form[operation]) {
      const opRoles = access.form[operation];
      const roles = Array.isArray(opRoles) ? opRoles : [opRoles];
      canAccess = registrar.client.user.hasRole(roles);
    } else {
      // No roles specified so can access
      canAccess = true;
    }
    return canAccess;
  }

  canCreate(form) {
    return this.canAccess('create', form);
  }

  canRead(form) {
    return this.canAccess('read', form);
  }

  canUpdate(form) {
    return this.canAccess('update', form);
  }

  canArchive(form) {
    return this.canAccess('archive', form);
  }
}

export default new Access();
