import Form from './form';
import FormEditor from './form-editor';
import Tabs from '../tabs';
import FormField from '../fields/form-field';
import Set from '../actions/set';
import Emit from '../actions/emit';
import JSONStringify from '../actions/json-stringify';
import Text from '../text';

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
            component: 'Field',
          },
        ],
      },

      fields: [
        new Tabs({
          name: 'tabs',
          items: [
            {
              name: 'edit',
              label: 'Edit',
              icon: 'Edit',
            },
            {
              name: 'preview',
              label: 'Preview',
              icon: 'ViewCompact',
            },
            {
              name: 'export',
              label: 'Export',
              icon: 'code',
            },
          ],
        }),

        new Text({
          name: 'mson',
          hidden: true,
        }),

        new FormField({
          name: 'form',
          form: new FormEditor(),
        }),
      ],

      listeners: [
        {
          event: 'fields.tabs.content.edit',
          actions: [
            new Set({
              name: 'fields.form.form.editable',
              value: true,
            }),
            new Emit({
              event: 'hideCode',
            }),
          ],
        },

        {
          event: 'fields.tabs.content.preview',
          actions: [
            new Set({
              name: 'fields.form.form.editable',
              value: false,
            }),
            new Emit({
              event: 'hideCode',
            }),
          ],
        },

        {
          event: 'fields.tabs.content.export',
          actions: [
            new JSONStringify({
              value: '{{mson}}',
              space: 2,
            }),
            new Set({
              name: 'fields.mson.content.text',
              value: '```js\n{{arguments}}\n```\n',
            }),
            new Emit({
              event: 'setCodeHidden',
              value: {
                hideCode: false,
                hideForm: true,
              },
            }),
          ],
        },

        {
          event: 'setCodeHidden',
          actions: [
            new Set({
              name: 'fields.mson.content.hidden',
              value: '{{arguments.hideCode}}',
            }),
            new Set({
              name: 'fields.form.hidden',
              value: '{{arguments.hideForm}}',
            }),
          ],
        },

        {
          event: 'hideCode',
          actions: [
            new Emit({
              event: 'setCodeHidden',
              value: {
                hideCode: true,
                hideForm: false,
              },
            }),
          ],
        },
      ],
    });
  }

  _setMSON(mson) {
    const fields = mson.fields.map((field) => {
      // Use componentName instead of component
      const value = {
        ...field,
        componentName: field.component,
      };
      delete value.component;
      return value;
    });

    this.get('fields.form.form.fields.fields').setValue(fields);
  }

  set(props) {
    super.set({ ...props, mson: undefined });

    if (props.mson !== undefined) {
      this._setMSON(props.mson);
    }

    // We also allow the MSON to be set via the value so that both the MSON and other values, like
    // id & userId, can be set simultaneously
    if (props.value !== undefined && props.value.mson !== undefined) {
      this._setMSON(props.value.mson);
    }
  }

  _getMSON() {
    return {
      component: 'Form',
      fields: this.get('fields.form.form.fields.fields').mapForms((form) => ({
        ...form.getValues({ default: false }),
        component: form.getValue('componentName'),
        componentName: undefined,
      })),
    };
  }

  getOne(name) {
    if (name === 'mson') {
      return this._getMSON();
    }

    return super.getOne(name);
  }
}
