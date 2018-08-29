import registrar from './compiler/registrar';
import AccessControl from './access-control';
import _ from 'lodash';

// Note: this function contains client-specific access control logic
class Access {
  constructor() {
    this._accessControl = new AccessControl();

    // For mocking
    this._registrar = registrar;
  }

  canAccess(operation, form) {
    let canAccess = false;
    const access = form.get('access');
    if (access && access.form && access.form[operation]) {
      const opRoles = access.form[operation];
      const roles = Array.isArray(opRoles) ? opRoles : [opRoles];
      canAccess = this._registrar.client.user.hasRole(roles);
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

  _fieldsOrValuesCanAccess(operation, form, getOpts, forFields, canDowngrade) {
    const access = form.get('access');
    const session = this._registrar.client.user.getSession();

    let indexedRoles = {};
    let isOwner = false;

    if (session && session.user.roles) {
      _.each(session.user.roles, (role, id) => {
        // The client uses the role name to check access
        indexedRoles[role.name] = true;
      });

      isOwner = session.user.id === form.get('userId');
    }
    const fieldValues = form.getValues(getOpts);

    const canAccessName = forFields ? 'fieldsCanAccess' : 'valuesCanAccess';

    return this._accessControl[canAccessName](
      operation,
      access,
      indexedRoles,
      fieldValues,
      isOwner,
      canDowngrade
    );
  }

  fieldsCanAccess(operation, form, getOpts, canDowngrade) {
    return this._fieldsOrValuesCanAccess(
      operation,
      form,
      getOpts,
      true,
      canDowngrade
    );
  }

  fieldsCanCreate(form) {
    return this.fieldsCanAccess('create', form, { out: true });
  }

  fieldsCanRead(form) {
    return this.fieldsCanAccess('read', form);
  }

  fieldsCanUpdate(form) {
    return this.fieldsCanAccess('update', form, { out: true });
  }

  valuesCanAccess(operation, form, getOpts) {
    return this._fieldsOrValuesCanAccess(operation, form, getOpts, false);
  }

  valuesCanCreate(form) {
    return this.valuesCanAccess('create', form, { out: true });
  }

  valuesCanRead(form) {
    return this.valuesCanAccess('read', form);
  }

  valuesCanUpdate(form) {
    return this.valuesCanAccess('update', form, { out: true });
  }
}

export default new Access();
