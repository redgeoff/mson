export default {
  name: 'LogInToAppAndRedirect',
  component: 'Action',
  actions: [
    {
      component: 'LogInToApp'
    },
    {
      component: 'Action',
      if: {
        globals: {
          redirectAfterLogin: {
            $in: [null, undefined]
          }
        }
      },
      actions: [
        {
          component: 'Redirect',
          path: '/'
        }
      ],
      else: [
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
