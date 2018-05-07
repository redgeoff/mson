import Form from './form';
// import _ from 'lodash';
// import { EmailField, PasswordField } from '../fields';
// import { MSONComponent } from '../fields';
import MSONComponent from '../component/mson-component';

export default class User extends Form {
  //   _create(props) {
  //     // Clone so that we don't modify original data
  //     props = _.clone(props);
  //
  //     const fields = [
  //       new EmailField({
  //         name: 'username',
  //         label: 'Username',
  //         required: true
  //       }),
  //       new PasswordField({
  //         name: 'password',
  //         label: 'Password',
  //         required: true
  //       })
  //     ];
  //
  //     if (props.fields) {
  //       props.fields = fields.concat(props.fields);
  // console.log('HAS FIELDS', props.fields);
  //     } else {
  // console.log('NO FIELDS');
  //       props.fields = fields;
  //     }
  //
  //     super._create(props);
  //   }

  // _createDefaultFields() {
  //   super._createDefaultFields();
  //   // this.addField(new EmailField({
  //   //   name: 'username',
  //   //   label: 'Username',
  //   //   required: true
  //   // }));
  //   // this.addField(new PasswordField({
  //   //   name: 'password',
  //   //   label: 'Password',
  //   //   required: true
  //   // }));
  // }

  _createDefaultFields() {
    super._createDefaultFields();

    this.addField(
      new MSONComponent({
        definition: {
          component: 'EmailField',
          name: 'username',
          label: 'Username',
          required: true
        }
      })
    );

    this.addField(
      new MSONComponent({
        definition: {
          component: 'PasswordField',
          name: 'password',
          label: 'Password',
          required: true
        }
      })
    );
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'roles');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'roles');
    return value === undefined ? super.getOne(name) : value;
  }
}

// export default class User extends Form {
//   _create(props) {
//     // Clone so that we don't modify original data
//     props = _.clone(props);
//
//     const fields = [
//       {
//         component: 'EmailField',
//         name: 'username',
//         label: 'Username',
//         required: true
//       },
//       {
//         component: 'PasswordField',
//         name: 'password',
//         label: 'Password',
//         required: true
//       }
//     ];
//
//     if (props.fields) {
//       props.fields = fields.concat(props.fields);
// console.log('HAS FIELDS', props.fields);
//     } else {
// console.log('NO FIELDS');
//       props.fields = fields;
//     }
//
//     super._create(props);
//   }
//
//   set(props) {
//     super.set(props);
//     this._setIfUndefined(props, 'roles');
//   }
//
//   getOne(name) {
//     const value = this._getIfAllowed(name, 'roles');
//     return value === undefined ? super.getOne(name) : value;
//   }
// }
