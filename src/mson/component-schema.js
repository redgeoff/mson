import builder from './builder';
import Form from './form';

// NOTE: we separate out ComponentSchema from Component as we don't want a circular dependency
// between Builder and Component.
export default class ComponentSchema {
  getSchemaForm(component) {
    const schemas = component.get('schema');
    const form = new Form();
    if (schemas) {
      schemas.forEach(schema => {
        const schemaForm = builder.newComponent(schema);
        form.copyFields(schemaForm);
      });
    }
    return form;
  }
}
