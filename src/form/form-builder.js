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
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'mson',
            component: 'Field'
          }
        ]
      },

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

  _setMSON(mson) {
    const fields = mson.fields.map(field => ({
      ...field,
      componentName: field.component
    }));

    this.get('fields.form.form.fields.fields').setValue(fields);
  }

  set(props) {
    super.set({ ...props, mson: undefined });

    if (props.mson !== undefined) {
      this._setMSON(props.mson);
    }
  }

  _getMSON() {
    return {
      component: 'Form',
      fields: this.get('fields.form.form.fields.fields').mapForms(form => ({
        ...form.getValues({ default: false }),
        component: form.getValue('componentName'),
        componentName: undefined
      }))
    };
  }

  getOne(name) {
    if (name === 'mson') {
      return this._getMSON();
    }

    return super.getOne(name);
  }
}
