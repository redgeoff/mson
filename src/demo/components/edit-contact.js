export default {
  name: 'app.EditContact',
  component: 'RecordEditor',
  baseForm: {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField',
        label: 'First Name',
        required: true,
        block: false
      },
      {
        name: 'lastName',
        component: 'TextField',
        label: 'Last Name'
      },
      {
        name: 'email',
        component: 'EmailField',
        label: 'Email'
      }
    ],
    listeners: [
      {
        event: 'load',
        actions: [
          {
            // Default the id to '1' so that we can edit the doc later. Usually, this id would come
            // from the route or the user's session
            component: 'Set',
            name: 'fields.id.value',
            value: '1'
          }
        ]
      }
    ]
  },
  label: 'Contact',
  store: {
    component: 'LocalStorageStore',
    storeName: 'contactLocalStorage'
  },
  storeWhere: {
    id: '1'
  }
};
