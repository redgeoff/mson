import TextField from './text-field';

export default class URLField extends TextField {
  className = 'URLField';

  create(props) {
    super.create(props);

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
            'multiline',
          ]),
          {
            name: 'newWindow',
            component: 'BooleanField',
          },
        ],
      },
    });
  }
}
