import contacts from './contacts';
import cloneDeep from 'lodash/cloneDeep';

// Customize for Firebase
const contactsFirebase = cloneDeep(contacts);
contacts.name = 'app.ContactsFirebase';
contacts.fields[0].store = {
  component: 'FirebaseStore',
  apiKey: 'AIzaSyCJfqjdBBrXtwkXla6uMX3LZGOLDAgTEx0',
  authDomain: 'mson-contacts.firebaseapp.com',
  projectId: 'mson-contacts',
  collection: 'contacts'
};

export default contactsFirebase;
