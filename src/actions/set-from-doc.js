export default {
  name: 'SetFromDoc',
  component: 'Action',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'doc',
        component: 'Field'
      }
    ]
  },
  actions: [
    {
      component: 'Set',
      name: '{{name}}',
      value: '{{action.doc.fieldValues}}'
    },
    {
      component: 'Set',
      name: '{{name}}',
      value: {
        id: '{{action.doc.id}}',
        userId: '{{action.doc.userId}}',
        createdAt: '{{action.doc.createdAt}}',
        updatedAt: '{{action.doc.updatedAt}}',
        archivedAt: '{{action.doc.archivedAt}}'
      }
    }
  ]
};
