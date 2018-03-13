// // TODO: replaced with JSON. Kept as Template
//
// import TextField from './text-field';
//
// // import Field from './field';
// // // TODO: how to generate boilerplate? Need something like CompositeField?
// // export default class PersonNameField extends Field {
// //   _listenForChanges() {
// //     this.on('err', err => {
// //       // Show error on firstName
// //       this._firstName.setErr(err);
// //     });
// //
// //     this._firstName.on('value', value => {
// //       this.setValue(Object.assign({}, this._value, { firstName: value }));
// //     });
// //     this._lastName.on('value', value => {
// //       this.setValue(Object.assign({}, this._value, { lastName: value }));
// //     });
// //
// //     this._firstName.on('touched', () => {
// //       this.set({ touched: true });
// //     });
// //     this._lastName.on('touched', () => {
// //       this.set({ touched: true });
// //     });
// //   }
// //
// //   _create() {
// //     this.set({ firstName: new TextField({ label: 'First Name', maxLength: 5 }) });
// //     this.set({ lastName: new TextField({ label: 'Last Name', maxLength: 5 }) });
// //     this._listenForChanges();
// //   }
// //
// //   set(props) {
// //     super.set(props);
// //
// //     if (props.name !== undefined) {
// //       this._firstName.set({ name: props.name + '_firstName' });
// //       this._lastName.set({ name: props.name + '_firstName' });
// //     }
// //
// //     if (props.required !== undefined) {
// //       this._firstName.set({ required: props.required });
// //       this._lastName.set({ required: props.required });
// //     }
// //
// //     if (props.value !== undefined) {
// //       this._firstName.setValue(props.value.firstName);
// //       this._lastName.setValue(props.value.lastName);
// //     }
// //
// //     this._setIfUndefined(props, 'firstName', 'lastName');
// //   }
// //
// //   getOne(name) {
// //     const value = this._getIfAllowed(name, 'firstName', 'lastName');
// //     return value === undefined ? super.getOne(name) : value;
// //   }
// //
// //   clearErr() {
// //     super.clearErr();
// //     this._firstName.clearErr();
// //     this._lastName.clearErr();
// //   }
// //
// //   setTouched(touched) {
// //     super.setTouched(touched);
// //     this._firstName.setTouched(touched);
// //     this._lastName.setTouched(touched);
// //   }
// //
// //   validate() {
// //     super.validate();
// //     this._firstName.validate();
// //     this._lastName.validate();
// //
// //     if (this._firstName._value === 'Geoff' && this._lastName._value === 'Cox') {
// //       this.setErr('cannot be Geoff Cox');
// //     }
// //   }
// // }
//
// import CompositeField from './composite-field';
//
// export default class PersonNameField extends CompositeField {
//   _create(props) {
//     super._create({
//       components: [
//         new TextField({ name: 'firstName', label: 'First Name', maxLength: 5 }),
//         new TextField({ name: 'lastName', label: 'Last Name', maxLength: 5 })
//       ]
//     });
//   }
// }
