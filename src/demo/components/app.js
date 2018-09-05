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
        content: {
          component: 'app.Contacts'
        }
      }
    ]
  }
};
