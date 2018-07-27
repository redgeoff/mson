export default {
  name: 'UpdatePasswordEditor',
  component: 'RecordEditor',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'updatePasswordBaseForm',
        component: 'Field'
      }
    ]
  },
  preview: false,
  label: 'Password',
  storeWhere: {
    userId: '{{globals.session.user.id}}'
  },
  baseForm: {
    component: 'UpdatePassword',
    componentToWrap: '{{updatePasswordBaseForm}}'
  }
};
