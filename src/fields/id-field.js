import TextField from './text-field';

export default class IdField extends TextField {
  _className = 'IdField';

  _create(props) {
    super._create(props);

    // Ids can also be a number. TODO: mixin validation/functionality from the NumberField?
    this._requireString = false;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          ...this.getHiddenFieldDefinitions([
            'minWords',
            'maxWords',
            'invalidRegExp',
            'multiline',
          ]),
        ],
      },
    });
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      if (['string', 'number'].indexOf(typeof value) === -1) {
        this.setErr(`must be a string or number`);
      }
    }
  }
}
