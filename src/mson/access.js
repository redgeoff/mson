import registrar from './compiler/registrar';
import AccessControl from './access-control';
import _ from 'lodash';

// Note: this function contains client-specific access control logic
class Access {
  constructor() {
    this._accessControl = new AccessControl();
  }

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

  fieldsCanAccess(operation, form) {
    const access = form.get('access');
    const session = registrar.client.user.getSession();

    let indexedRoles = {};
    let isOwner = false;

    if (session && session.user.roles) {
      _.each(session.user.roles, (role, id) => {
        // The client uses the role name to check access
        indexedRoles[role.name] = true;
      });

      isOwner = session.user.id === form.get('userId');
    }
    const fieldValues = form.getValues();

    return this._accessControl.fieldsCanAccess(
      operation,
      access,
      indexedRoles,
      fieldValues,
      isOwner
    );
  }

  fieldsCanCreate(form) {
    return this.fieldsCanAccess('create', form);
  }

  fieldsCanRead(form) {
    return this.fieldsCanAccess('read', form);
  }

  fieldsCanUpdate(form) {
    return this.fieldsCanAccess('update', form);
  }
}

export default new Access();
