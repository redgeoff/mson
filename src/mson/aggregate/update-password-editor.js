export default {
  component: 'RecordEditor',
  props: ['updatePasswordBaseForm'],
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
