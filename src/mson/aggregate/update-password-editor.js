export default {
  name: 'UpdatePasswordEditor',
  component: 'RecordEditor',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'updatePasswordBaseForm',
        component: 'Field',
        required: true
      },
      {
        name: 'storeName',
        component: 'TextField',
        required: true
      }
    ]
  },
  preview: false,
  baseForm: {
    component: 'UpdatePassword',
    baseForm: '{{updatePasswordBaseForm}}',
    storeName: '{{storeName}}'
  },
  label: 'Password',
  storeWhere: {
    userId: '{{globals.session.user.id}}'
  }
};
