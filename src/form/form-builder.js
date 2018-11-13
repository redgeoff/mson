import Form from './form';
import FormEditor from './form-editor';
import Tabs from '../tabs';
import FormField from '../fields/form-field';
import Set from '../actions/set';

export default class FormBuilder extends Form {
  _className = 'FormBuilder';

  _create(props) {
    super._create(props);

    this.set({
      fields: [
        new Tabs({
          name: 'tabs',
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
        }),

        new FormField({
          name: 'form',
          form: new FormEditor()
        })
      ],

      listeners: [
        {
          event: 'fields.tabs.content.edit',
          actions: [
            new Set({
              name: 'fields.form.form.editable',
              value: true
            })
          ]
        },

        {
          event: 'fields.tabs.content.preview',
          actions: [
            new Set({
              name: 'fields.form.form.editable',
              value: false
            })
          ]
        }
      ]
    });
  }
}
