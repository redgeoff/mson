import TextField from './text-field';

export default class URLField extends TextField {
  _className = 'URLField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          ...this.getHiddenFieldDefinitions([
            'minLength',
            'maxLength',
            'minWords',
            'maxWords',
            'invalidRegExp',
            'multiline'
          ]),
          {
            name: 'newWindow',
            component: 'BooleanField'
          }
        ]
      }
    });
  }
}
