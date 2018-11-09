export default {
  name: 'FormBuilder',
  component: 'Form',
  fields: [
    {
      name: 'tabs',
      component: 'Tabs',
      items: [
        {
          name: 'edit',
          label: 'Edit',
          icon: 'Edit'
        },
        {
          name: 'preview',
          label: 'Preview',
          icon: 'ViewCompact'
        }
      ]
    },

    {
      name: 'form',
      component: 'FormField',
      form: {
        component: 'FormEditor'
      }
    }
  ],

  listeners: [
    {
      event: 'fields.tabs.content.edit',
      actions: [
        {
          component: 'Set',
          name: 'fields.form.form.editable',
          value: true
        }
      ]
    },

    {
      event: 'fields.tabs.content.preview',
      actions: [
        {
          component: 'Set',
          name: 'fields.form.form.editable',
          value: false
        }
      ]
    }
  ]
};
