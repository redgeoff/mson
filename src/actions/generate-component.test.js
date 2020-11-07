import GenerateComponent from './generate-component';
// import Form from '../form';
// import Factory from '../component/factory';
import compiler from '../compiler';

it('should generate component', async () => {
  // let form;

  const generateComponent = new GenerateComponent({
    // componentFactory: new Factory({
    //   product: () => {
    //     form = new Form({
    //       fields: [
    //         {
    //           component: 'PersonFullNameField',
    //           name: 'name',
    //         },
    //       ],
    //     });
    //     return form;
    //   },
    // }),
    // const generatedForm = await generateComponent.act();
    // expect(generatedForm).toEqual(form);

    definition: JSON.stringify({
      component: '{{arguments}}',
      fields: [
        {
          component: 'PersonFullNameField',
          name: 'name',
          value: 'Harriet',
        },
      ],
    }),
  });
  generateComponent._registrar.compiler = compiler;

  const generatedForm = await generateComponent.run({ arguments: 'Form' });
  expect(generatedForm.getValue('name')).toEqual('Harriet');
});
