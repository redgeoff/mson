import Form from './form';
import TextField from './fields/text-field';

const nameForm = new Form({
  fields: [
    new TextField({
      name: 'firstName',
      label: 'First Name',
      required: true,
      maxLength: 10
    }),
    new TextField({
      name: 'lastName',
      label: 'Last Name',
      required: true
    })
  ]
});

const emailForm = new Form({
  fields: [
    new TextField({
      name: 'email',
      label: 'Email',
      required: true
    })
  ]
});

const form = new Form({
  fields: [
    // TODO: use FormField instead
    // new FormsField({
    //   name: 'fullName',
    //   label: 'Full Name',
    //   form: nameForm
    // }),

    new TextField({
      name: 'title',
      label: 'Title',
      maxLength: 10
    })

    // new FormsField({
    //   name: 'emails',
    //   label: 'Emails',
    //   form: emailForm,
    //   maxSize: 2
    // })
  ]
});

it('should validate schema', () => {
  form.setValues({
    title: 'Founder'
  });
  form.validate();
  expect(form.hasErr()).toBe(false);

  form.setValues({
    title: 'Founder of Things'
  });
  form.validate();
  expect(form.hasErr()).toBe(true);
});
