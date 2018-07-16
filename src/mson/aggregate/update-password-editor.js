export default {
  component: 'RecordEditor',
  props: ['updatePasswordBaseForm'],
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'updatePasswordBaseForm',
        component: 'Field',
        required: true
      }
    ]
  },
  preview: false,
  baseForm: {
    component: 'UpdatePassword',
    baseForm: '{{updatePasswordBaseForm}}'
  },
  label: 'Password',
  recordWhere: {
    userId: '{{globals.session.user.id}}'
  }
};
