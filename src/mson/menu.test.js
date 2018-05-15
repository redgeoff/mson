import Menu from './menu';
import testUtils from './test-utils';

it('should index by path', () => {
  const colors = [
    {
      path: 'red',
      label: 'Red',
      items: [
        {
          path: 'light-red',
          label: 'Light Red',
          items: [
            {
              path: 'light-light-red',
              label: 'Light Light Red'
            }
          ]
        },
        {
          path: 'dark-red',
          label: 'Dark Red'
        }
      ]
    },
    {
      path: 'green',
      label: 'Green'
    }
  ];

  const menu = new Menu({ items: colors });

  expect(menu.getItem('red')).toEqual(colors[0]);
  expect(menu.getItem('light-red')).toEqual(colors[0].items[0]);
  expect(menu.getItem('light-light-red')).toEqual(colors[0].items[0].items[0]);
  expect(menu.getItem('green')).toEqual(colors[1]);
});

it('should validate schema', () => {
  testUtils.expectSchemaToBeValid(new Menu(), {
    name: 'app.Menu',
    component: 'Menu',
    items: [
      {
        path: '/people',
        label: 'People',
        content: {
          component: 'Form',
          fields: [
            {
              name: 'people',
              label: 'People',
              component: 'FormsField',
              form: {
                component: 'Form',
                fields: [
                  {
                    name: 'firstName',
                    component: 'TextField',
                    label: 'First Name'
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  });
});
