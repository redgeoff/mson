import Email from './email';
import compiler from '../compiler';

it('should send email', async () => {
  const form = compiler.newComponent({
    component: 'Form',
    fields: [
      {
        component: 'EmailField',
        name: 'to'
      },
      {
        component: 'TextField',
        name: 'subject'
      },
      {
        component: 'TextField',
        name: 'body'
      }
    ]
  });
  form.setValues({
    to: 'test@example.com',
    subject: 'My subject',
    body: 'My body'
  });

  const email = new Email({
    to: '{{fields.to.value}}',
    subject: '{{fields.subject.value}}',
    body: '{{fields.body.value}}'
  });

  const sendEmailSpy = jest.spyOn(email, '_sendEmail').mockImplementation();

  await email.act({ component: form });

  expect(sendEmailSpy).toHaveBeenCalledWith(form.getValues({ blank: false }));
});
