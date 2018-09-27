export default {
  name: 'app.FieldsScreen',
  component: 'app.Fields',
  fields: [
    {
      name: 'toggleDisplayValues',
      component: 'ButtonField',
      label: 'Show Display Values',
      icon: 'ViewHeadline'
    },
    {
      name: 'toggleDisabled',
      component: 'ButtonField',
      label: 'Disable',
      icon: 'Lock'
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
                  icon: 'Input'
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
    },
    {
      event: 'toggleDisabled',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.id.disabled': {
              $ne: true
            }
          },
          actions: [
            {
              component: 'Set',
              name: 'component',
              value: {
                disabled: true,
                'fields.toggleDisabled': {
                  label: 'Enable',
                  icon: 'LockOpen'
                }
              }
            },
            {
              // Renable so we can still click the button
              component: 'Set',
              name: 'fields.toggleDisabled.disabled',
              value: false
            }
          ],
          else: [
            {
              component: 'Set',
              name: 'component',
              value: {
                disabled: false,
                'fields.toggleDisabled': {
                  label: 'Disable',
                  icon: 'Lock'
                }
              }
            }
          ]
        }
      ]
    }
  ]
};
