import Container from './container';
import { TextField } from './fields';

it('should set content', () => {
  const container = new Container({
    content: new TextField({
      name: 'crypto',
      value: 'Dogecoin',
    }),
  });
  expect(container.get('content').getValue()).toEqual('Dogecoin');
});
