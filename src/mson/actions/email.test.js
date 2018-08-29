import Email from './email';
import compiler from '../compiler';

it('should send email', async () => {
  const form = compiler.newComponent({
    component: 'Form',
    fields: [
      {
        component: 'EmailField',
        name: 'from'
      },
      {
        component: 'EmailField',
        name: 'sender'
      },
      {
        component: 'EmailField',
        name: 'replyTo'
      },
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
    from: 'from@example.com',
    sender: 'sender@example.com',
    replyTo: 'reply-to@example.com',
    to: 'test@example.com',
    subject: 'My subject',
    body: 'My body'
  });

  const email = new Email({
    from: '{{fields.from.value}}',
    sender: '{{fields.sender.value}}',
    replyTo: '{{fields.replyTo.value}}',
    to: '{{fields.to.value}}',
    subject: '{{fields.subject.value}}',
    body: '{{fields.body.value}}'
  });

  email._registrar = {
    email: {
      send: () => {}
    }
  };

  const sendEmailSpy = jest.spyOn(email._registrar.email, 'send');

  await email.run({ component: form });

  expect(sendEmailSpy).toHaveBeenCalledWith(form.getValues({ blank: false }));
});
