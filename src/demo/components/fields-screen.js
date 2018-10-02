export default {
  name: 'app.FieldsScreen',
  component: 'app.Fields',
  fields: [
    {
      name: 'import',
      component: 'ButtonField',
      label: 'Import',
      icon: 'ImportContacts'
    },
    {
      name: 'reset',
      component: 'ButtonField',
      label: 'Reset',
      icon: 'ClearAll'
    },
    {
      name: 'toggleDisplayValues',
      component: 'ButtonField',
      label: 'Show Display Values',
      icon: 'ViewHeadline'
    },
    {
      name: 'toggleEditable',
      component: 'ButtonField',
      label: 'Immutable',
      icon: 'NotInterested'
    },
    {
      name: 'toggleDisabled',
      component: 'ButtonField',
      label: 'Disable',
      icon: 'Lock'
    },
    {
      name: 'toggleFullWidth',
      component: 'ButtonField',
      label: 'Full Width',
      icon: 'FormatAlignJustify'
    },
    {
      name: 'log',
      component: 'ButtonField',
      label: 'Log Values',
      icon: 'MoveToInbox'
    }
  ],
  listeners: [
    {
      event: 'import',
      actions: [
        {
          component: 'Set',
          name: 'component',
          value: {
            'fields.booleanField.value': true,
            'fields.chainedSelectField.value': [2, 5, 9, 10],
            'fields.chainedSelectListField.value': [[1, 3, 7], [2, 5, 9, 10]],
            'fields.collectionField.value': [
              {
                id: 'daenerys',
                firstName: 'Daenerys',
                lastName: 'Targaryen'
              },
              {
                id: 'jon',
                firstName: 'Jon',
                lastName: 'Snow'
              },
              {
                id: 'tyrion',
                firstName: 'Tyrion',
                lastName: 'Lannister'
              }
            ],
            'fields.dateField.value': '2018-09-27T17:24:24.960Z',
            'fields.emailField.value': 'test@example.com',
            'fields.idField.value': 'id-123',
            'fields.integerField.value': 123,
            'fields.listFieldEmail.value': [
              'test1@example.com',
              'test2@example.com'
            ],
            'fields.listFieldName.value': [
              { firstName: 'Ella', lastName: 'Fitzgerald' },
              { firstName: 'Ray', lastName: 'Charles' }
            ],
            'fields.moneyField.value': 1000000.11,
            'fields.numberField.value': 123.4,
            'fields.passwordField.value': 'password',
            'fields.personFullNameField.value': {
              firstName: 'Daenerys',
              lastName: 'Targaryen'
            },
            'fields.personNameField.value': 'Daenerys',
            'fields.phoneField.value': '6461234567',
            'fields.selectField.value': 'red',
            'fields.selectFieldMult.value': ['red', 'blue'],
            'fields.selectListField.value': ['red', 'green'],
            'fields.timeField.value': '2018-09-27T17:24:24.960Z',
            'fields.textField.value': 'Go MSON',
            'fields.textListField.value': ['MSON', 'React', 'Material-UI']
          }
        }
      ]
    },
    {
      event: 'reset',
      actions: [
        {
          component: 'Set',
          name: 'reset',
          value: true
        }
      ]
    },
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
      event: 'toggleEditable',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.id.editable': {
              $ne: true
            }
          },
          actions: [
            {
              component: 'Set',
              name: 'component',
              value: {
                editable: true,
                'fields.toggleEditable': {
                  label: 'Immutable',
                  icon: 'NotInterested'
                }
              }
            }
          ],
          else: [
            {
              component: 'Set',
              name: 'component',
              value: {
                editable: false,
                'fields.toggleEditable': {
                  label: 'Editable',
                  icon: 'Edit'
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
    },
    {
      event: 'toggleFullWidth',
      actions: [
        {
          component: 'Action',
          if: {
            'fields.id.fullWidth': {
              $ne: true
            }
          },
          actions: [
            {
              component: 'Set',
              name: 'component',
              value: {
                fullWidth: true,
                'fields.toggleFullWidth': {
                  label: 'Flex Width',
                  icon: 'FormatAlignLeft'
                }
              }
            }
          ],
          else: [
            {
              component: 'Set',
              name: 'component',
              value: {
                fullWidth: false,
                'fields.toggleFullWidth': {
                  label: 'Full Width',
                  icon: 'FormatAlignLeft'
                }
              }
            }
          ]
        }
      ]
    },
    {
      event: 'log',
      actions: [
        {
          component: 'ConsoleLog',
          message: '{{value}}'
        }
      ]
    }
  ]
};
