import Form from './form';
import TextField from '../fields/text-field';

// Note: we use JS to define the component so that we can use `instanceof ComponentForm`
export default class ComponentForm extends Form {
  _className = 'ComponentForm';

  _create(props) {
    super._create(props);

    const fields = [
      new TextField({
        name: 'definition',
        label: 'Definition',
        required: true
      })
    ];

    // By default, lock down access
    const access = {
      form: {
        create: 'admin',
        read: 'admin',
        update: 'admin',
        archive: 'admin'
      }
    };

    this.set({
      access,
      fields
    });
  }
}
