import GenerateComponent from './generate-component';
import Form from '../form';
import Factory from '../component/factory';

it('should generate component', async () => {
  let form;

  const generateComponent = new GenerateComponent({
    componentFactory: new Factory({
      product: () => {
        form = new Form({
          fields: [
            {
              component: 'PersonFullNameField',
              name: 'name',
            },
          ],
        });
        return form;
      },
    }),
  });

  const generatedForm = await generateComponent.act();
  expect(generatedForm).toEqual(form);
});
