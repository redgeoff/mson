export default {
  name: 'app.ContactsFirebase',
  component: 'app.Contacts',
  store: {
    component: 'FirebaseStore',
    apiKey: 'AIzaSyCJfqjdBBrXtwkXla6uMX3LZGOLDAgTEx0',
    authDomain: 'mson-contacts.firebaseapp.com',
    projectId: 'mson-contacts',
    collection: 'contacts'
  }
};
