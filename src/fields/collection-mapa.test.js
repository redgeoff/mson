import CollectionMapa from './collection-mapa';
import Form from '../form';
import { TextField } from '.';

it('should set prop', () => {
  const mapa = new CollectionMapa();

  const form = new Form({
    fields: [new TextField({ name: 'lastName' })]
  });

  mapa._setProp(form, 'lastName', 'Turing');
  expect(form.getValue('lastName')).toEqual('Turing');
});
