import Component from './component';

export default class Text extends Component {
  _className = 'Text';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'text',
            component: 'TextField',
            label: 'Text',
            multiline: true,
            docLevel: 'basic',
            help: 'Any markdown. See markdownguide.org'
          }
        ]
      }
    });
  }
}
