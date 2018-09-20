export default {
  name: 'app.App',
  component: 'App',
  // menuAlwaysTemporary: true,
  menu: {
    component: 'Menu',
    items: [
      {
        path: '/fields',
        label: 'Fields',
        content: {
          component: 'app.Fields'
        }
      },
      {
        path: '/contacts',
        label: 'Contacts',
        items: [
          {
            path: '/contacts',
            label: 'Contacts LocalStorage',
            content: {
              component: 'app.ContactsLocalStorage'
            }
          },
          {
            path: '/contacts-firebase',
            label: 'Contacts Firebase',
            content: {
              component: 'app.ContactsFirebase'
            }
          }
        ]
      },
      {
        path: '/contact/edit',
        label: 'Edit Contact',
        content: {
          component: 'app.EditContact'
        }
      },
      {
        path: '/contact-no-mson',
        label: 'Contact No MSON',
        content: {
          component: 'app.ContactNoMSON'
        }
      }
    ]
  }
};
