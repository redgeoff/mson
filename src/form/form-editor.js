import Form from './form';
import CollectionField from '../fields/collection-field';
import Factory from '../component/factory';
import FieldEditorForm from './field-editor-form';
import utils from '../utils';

export default class FormEditor extends Form {
  _className = 'FormEditor';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'definition',
            component: 'Field',
          },
        ],
      },

      fields: [
        new CollectionField({
          name: 'fields',
          label: 'Fields',
          hideLabel: true,
          maxColumns: 1,
          skipRead: true,
          includeExtraneous: true,
          forbidOrder: false,
          formFactory: new Factory({
            // Generate a unique id so that the UI has a key when displaying a list of items. We
            // generate the id here as we don't want the rendering layer adding the ids.
            // product: () => new FieldEditorForm({ value: { id: utils.uuid() } }),
            // product: () => new FieldEditorForm({
            //   value: { id: utils.uuid() },
            //   validators: [
            //     {
            //       where: {
            //         fields: {
            //           name: {
            //             value: 'foo'
            //           }
            //         }
            //       },
            //       error: {
            //         field: 'name',
            //         error: 'must not be foo'
            //       }
            //     }
            //   ]
            // }),
            product: () =>
              new FieldEditorForm({
                value: { id: utils.uuid() },
                validators: [
                  {
                    where: {
                      parent: {
                        value: {
                          $elemMatch: {
                            $and: [
                              {
                                id: {
                                  $ne: '{{fields.id.value}}',
                                },
                              },
                              { name: '{{fields.name.value}}' },
                            ],
                          },
                        },
                      },

                      // parent: {
                      //   value: 'foo'
                      // }

                      // parent {
                      //   fields: {
                      //     name: {
                      //       value: 'foo'
                      //     }
                      //   }
                      // }
                    },
                    error: {
                      field: 'name',
                      error: 'must be unique',
                    },
                  },
                ],
              }),
          }),
        }),
      ],
    });
  }

  _setDefinition(definition) {
    const fields = definition.fields.map((field) => ({
      ...field,
      componentName: field.component,
    }));

    this.get('fields.fields').setValue(fields);
  }

  set(props) {
    super.set({ ...props, definition: undefined });

    if (props.definition !== undefined) {
      this._setDefinition(props.definition);
    }
  }

  _getDefinition() {
    return {
      component: 'Form',
      fields: this.get('fields.fields').mapForms((form) => ({
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
