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
      value: '{{parent.doc.fieldValues}}'
    },
    {
      component: 'Set',
      name: '{{name}}',
      value: {
        id: '{{parent.doc.id}}',
        userId: '{{parent.doc.userId}}',
        createdAt: '{{parent.doc.createdAt}}',
        updatedAt: '{{parent.doc.updatedAt}}',
        archivedAt: '{{parent.doc.archivedAt}}'
      }
    }
  ]
};
