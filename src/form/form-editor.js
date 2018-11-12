import Form from './form';
import CollectionField from '../fields/collection-field';
import Factory from '../component/factory';
import FieldEditorForm from './field-editor-form';

export default class FormEditor extends Form {
  _className = 'FormEditor';

  _create(props) {
    super._create(props);

    this.set({
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
            product: () => new FieldEditorForm()
          })
        })
      ]
    });
  }
}
