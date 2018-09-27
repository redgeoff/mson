export default {
  name: 'app.FieldsScreen',
  component: 'app.Fields',
  fields: [
    {
      name: 'toggleDisplayValues',
      component: 'ButtonField',
      label: 'Show Display Values',
      icon: 'ViewHeadline'
    }
  ],
  listeners: [
    {
      event: 'toggleDisplayValues',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.id.useDisplayValue': {
              $ne: true
            }
          },
          actions: [
            {
              component: 'Set',
              name: 'component',
              value: {
                eachField: {
                  useDisplayValue: true
                },
                'fields.toggleDisplayValues': {
                  label: 'Hide Display Values',
                  icon: 'ViewStream'
                }
              }
            }
          ],
          else: [
            {
              component: 'Set',
              name: 'component',
              value: {
                eachField: {
                  useDisplayValue: false
                },
                'fields.toggleDisplayValues': {
                  label: 'Show Display Values',
                  icon: 'ViewHeadline'
                }
              }
            }
          ]
        }
      ]
    }
  ]
};
