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
              component: 'app.Contacts'
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
      }
    ]
  }
};
