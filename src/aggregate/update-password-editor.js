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
        // Not required as updatePasswordBaseForm will populate baseForm
        name: 'baseForm',
        required: false
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
