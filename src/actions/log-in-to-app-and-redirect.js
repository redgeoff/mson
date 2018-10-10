export default {
  name: 'LogInToAppAndRedirect',
  component: 'Action',
  actions: [
    {
      component: 'LogInToApp'
    },
    {
      if: {
        globals: {
          redirectAfterLogin: null
        }
      },
      component: 'Redirect',
      path: '/'
    },
    {
      component: 'Action',
      if: {
        globals: {
          redirectAfterLogin: {
            $ne: null
          }
        }
      },
      actions: [
        {
          component: 'Redirect',
          path: '{{globals.redirectAfterLogin}}'
        },
        {
          component: 'Set',
          name: 'globals.redirectAfterLogin',
          value: null
        }
      ]
    }
  ]
};
