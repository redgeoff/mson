import Form from './form';
import TextField from './fields/text-field';
import FormsField from './fields/forms-field';
import ListField from './fields/list-field';

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
    new FormsField({
      name: 'fullName',
      label: 'Full Name',
      form: nameForm
    }),

    new TextField({
      name: 'title',
      label: 'Title',
      maxLength: 10
    }),

    new FormsField({
      name: 'emails',
      label: 'Emails',
      form: emailForm,
      maxSize: 2
    }),

    new ListField({
      name: 'phoneNumbers',
      label: 'Phone Numbers',
      field: new TextField({
        name: 'phone',
        label: 'Phone',
        required: true
      }),
      maxSize: 2
    })
  ]
});

it('should set and get nested values', () => {
  form.setValues({
    fullName: {
      firstName: 'Ella',
      lastName: 'Fitzgerald'
    },
    title: 'Founder',
    emails: [
      {
        email: 'ella1@example.com'
      },
      {
        email: 'ella2@example.com'
      }
    ],
    phoneNumbers: ['(206) 111-1111', '(206) 222-2222']
  });
  // TODO: check values
  console.log('values=', form.getValues());

  form
    .getField('emails')
    .getForm(0)
    .setValues({ email: 'ella3@example.com' });

  // TODO: need to implement
  // form.getField('fullName').setValues({ lastName: 'Fitz' });

  form
    .getField('phoneNumbers')
    .getField(0)
    .setValue('(206) 333-3333');

  console.log('values=', form.getValues());

  // TODO: modify values via form.getField()... and then check with getValues()
});

// it('should validate nested values', () => {
//   form.setValues({
//     fullName: {
//       firstName: 'Ella',
//       lastName: 'Fitzgerald'
//     },
//     title: 'Founder',
//     emails: [
//       {
//         email: 'ella1@example.com'
//       },
//       {
//         email: 'ella2@example.com'
//       }
//     ],
//     phoneNumbers: ['(206) 111-1111', '(206) 222-2222']
//   });
//   console.log('values=', form.getValues());
//   form.validate();
//   expect(form.hasErr()).toBe(false);
//
//   // form.setValues({
//   //   'title': 'Founder of Things'
//   // });
//   // form.validate();
//   // expect(form.hasErr()).toBe(true);
//   // TODO: actually check errors
// });
