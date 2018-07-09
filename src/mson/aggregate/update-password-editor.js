export default {
  component: 'RecordEditor',
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
