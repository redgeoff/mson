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
      value: '{{action.parent.doc.fieldValues}}'
    },
    {
      component: 'Set',
      name: '{{name}}',
      value: {
        id: '{{action.parent.doc.id}}',
        userId: '{{action.parent.doc.userId}}',
        createdAt: '{{action.parent.doc.createdAt}}',
        updatedAt: '{{action.parent.doc.updatedAt}}',
        archivedAt: '{{action.parent.doc.archivedAt}}'
      }
    }
  ]
};
