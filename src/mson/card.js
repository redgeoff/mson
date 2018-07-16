import Component from './component';

export default class Card extends Component {
  _create(props) {
    super._create(props);
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'title',
            component: 'TextField',
            label: 'Title'
          },
          {
            name: 'content',
            component: 'Field',
            label: 'Content',
            required: true
          }
        ]
      }
    });

    this._bubbleUpLoad();
  }

  _bubbleUpLoad() {
    this.on('load', () => {
      const content = this.get('content');
      if (content) {
        content.emitLoad();
      }
    });
  }
}
