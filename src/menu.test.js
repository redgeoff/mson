import Menu from './menu';
import testUtils from './test-utils';

const expectItemToEqual = (item1, item2) => {
  expect(item1.path).toEqual(item2.path);
};

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
        },
        {
          path: 'dark-red/user/:userId/blog/:blogId',
          label: 'Dark Red Blog'
        },
        {
          label: 'Medium Red'
        }
      ]
    },
    {
      path: 'green',
      label: 'Green'
    }
  ];

  const menu = new Menu({ items: colors });

  expectItemToEqual(menu.getItem('red'), colors[0]);
  expectItemToEqual(menu.getItem('light-red'), colors[0].items[0]);
  expectItemToEqual(
    menu.getItem('light-light-red'),
    colors[0].items[0].items[0]
  );
  expectItemToEqual(menu.getItem('green'), colors[1]);
  expectItemToEqual(
    menu.getItem('dark-red/user/myUserId/blog/myBlogId'),
    colors[0].items[2]
  );
  expect(menu.getItem('not-found')).toBeNull();

  const item = menu.getItemAndParsePath('dark-red/user/myUserId/blog/myBlogId');
  expect(item.params).toEqual({
    userId: 'myUserId',
    blogId: 'myBlogId'
  });

  expectItemToEqual(
    menu.getParent(colors[0].items[0].items[0].path),
    colors[0].items[0]
  );
  expectItemToEqual(menu.getFirstItem(), colors[0]);
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
              component: 'CollectionField',
              formFactory: {
                component: 'Factory',
                product: {
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
            }
          ]
        }
      }
    ]
  });
});

it('should convert to route', () => {
  const menu = new Menu();

  const parameters = {
    foo: 'bar'
  };

  const hash = 'myHash';

  const route = menu.toRoute({
    parameters,
    queryString: 'yar=nar&star=jar',
    hash
  });

  expect(route).toEqual({
    parameters,
    query: {
      yar: 'nar',
      star: 'jar'
    },
    hash
  });
});
