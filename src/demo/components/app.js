export default {
  name: 'app.App',
  component: 'App',
  menu: {
    component: 'Menu',
    items: [
      {
        path: '/fields',
        label: 'Fields',
        content: {
          component: 'app.Fields'
        }
      }
    ]
  }
};
