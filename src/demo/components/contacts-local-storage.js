export default {
  name: 'app.ContactsLocalStorage',
  component: 'app.Contacts',
  store: {
    component: 'LocalStorageStore',
    storeName: 'contactsLocalStorage'
  }
};
