import Form from './form';
import Field from '../fields/field';
import FormField from '../fields/form-field';

// e.g.
// access: {
//   form: {
//     create: 'role2',
//     read: [ 'role1', 'role2' ],
//     update: [ 'role1', 'role2' ],
//     archive: 'role2'
//   },
//
//   fields: {
//     firstName: {
//       create: 'role2',
//       read: [ 'role1', 'role2' ],
//       update: 'role2',
//       archive: 'role2'
//     }
//   }
// }

class AccessRolesField extends Field {
  _className = 'AccessRolesField';

  _create(props) {
    super._create(Object.assign({}, props, { allowScalar: true }));
  }
}

class AccessNode extends Form {
  _className = 'AccessNode';

  _create(props) {
    super._create(props);

    this.addField(new AccessRolesField({ name: 'create', label: 'Create' }));
    this.addField(new AccessRolesField({ name: 'read', label: 'Create' }));
    this.addField(new AccessRolesField({ name: 'update', label: 'Create' }));
    this.addField(new AccessRolesField({ name: 'archive', label: 'Create' }));
  }
}

class AccessFields extends Form {
  _className = 'AccessFields';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'fieldNames',
            component: 'Field' // TODO: properly define
          }
        ]
      }
    });
  }

  set(props) {
    super.set(props);
    if (props.fieldNames !== undefined) {
      this.removeFieldsExcept();
      props.fieldNames.forEach(fieldName => {
        this.addField(
          new FormField({
            name: fieldName,
            form: new AccessNode()
          })
        );
      });
    }
  }
}

export default class FormAccess extends Form {
  _className = 'FormAccess';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'fieldNames',
            component: 'Field' // TODO: properly define
          }
        ]
      }
    });

    this.addField(
      new FormField({
        name: 'form',
        label: 'Form',
        form: new AccessNode()
      })
    );

    this.addField(
      new FormField({
        name: 'fields',
        label: 'Fields',
        form: new AccessFields()
      })
    );
  }

  set(props) {
    super.set(props);
    if (props.fieldNames !== undefined) {
      this.getField('fields')
        .getForm()
        .set({ fieldNames: props.fieldNames });
    }
  }
}
