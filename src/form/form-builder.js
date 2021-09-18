import Form from './form';
import FormEditor from './form-editor';
import Tabs from '../tabs';
import FormField from '../fields/form-field';
import Set from '../actions/set';
import Emit from '../actions/emit';
import JSONStringify from '../actions/json-stringify';
import Text from '../text';
import Fragment from '../fragment';
import Field from '../fields/field';

export default class FormBuilder extends Form {
  className = 'FormBuilder';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            // This name is needed so that we can make sure to relay the value to the backend or any
            // front-end component cache
            name: 'formName',
            component: 'TextField',
          },
          {
            name: 'definition',
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

        // Note: Fragment is not a field so it will be wrapped with a field and accessible at
        // `fields.export.content`
        new Fragment({
          name: 'export',
          hidden: true,
          items: [
            new Field({ name: 'header' }),
            new Text({ name: 'definition' }),
            new Field({ name: 'footer' }),
          ],
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
              value: '{{definition}}',
              space: 2,
            }),
            new Set({
              // TODO: Can this be 'fields.export.content.items.definition.text' instead?
              name: 'fields.export.content.items.1.text',
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
              name: 'fields.export.content.hidden',
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

  _setDefinition(definition) {
    const fields = definition.fields.map((field) => {
      // Use componentName instead of component
      const value = {
        ...field,
        componentName: field.component,
      };
      delete value.component;
      return value;
    });

    this.get('fields.form.form.fields.fields').setValue(fields);
    this.set({ formName: definition.name });
  }

  set(props) {
    super.set({ ...props, definition: undefined });

    if (props.definition !== undefined) {
      this._setDefinition(props.definition);
    }

    // We also allow the definition to be set via the value so that both the definition and other
    // values, like id & userId, can be set simultaneously
    if (props.value !== undefined && props.value.definition !== undefined) {
      this._setDefinition(props.value.definition);
    }
  }

  _getDefinition() {
    return {
      name: this.get('formName'),
      component: 'Form',
      fields: this.get('fields.form.form.fields.fields').mapForms((form) => ({
        ...form.getValues({ default: false }),
        component: form.getValue('componentName'),
        componentName: undefined,
      })),
    };
  }

  getOne(name) {
    if (name === 'definition') {
      return this._getDefinition();
    }

    return super.getOne(name);
  }
}
