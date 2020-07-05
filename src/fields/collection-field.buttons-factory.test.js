import ButtonField from './button-field';
import CollectionField from './collection-field';
import TextField from './text-field';
import Form from '../form';
import Factory from '../component/factory';

it('should set parent of buttonsFactory', async () => {
  const field = new CollectionField({
    formFactory: new Factory({
      product: () => {
        return new Form({
          fields: [new TextField({ name: 'color' })],
        });
      },
    }),
    buttonsFactory: new Factory({
      product: () => {
        return new ButtonField({ name: 'edit' });
      },
    }),
  });

  field.setValue([{ color: 'red' }, { color: 'green' }]);

  field.eachForm((form) => {
    const formExtras = field.getFormExtras(form);
    expect(formExtras.buttons.get('parent')).toEqual(form);
  });
});
