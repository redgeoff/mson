import Menu from './menu';

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
