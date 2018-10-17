import TextField from './text-field';

export default class IdField extends TextField {
  _className = 'IdField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          ...this.getHiddenFieldDefinitions([
            'minWords',
            'maxWords',
            'invalidRegExp',
            'multiline'
          ])
        ]
      }
    });
  }
}
