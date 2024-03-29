import UIComponent from './ui-component';

export default class Card extends UIComponent {
  className = 'Card';

  create(props) {
    super.create(props);
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'title',
            component: 'TextField',
            label: 'Title',
          },
          {
            name: 'content',
            component: 'Field',
            label: 'Content',
            required: true,
          },
          {
            name: 'searchString',
            component: 'TextField',
          },
          {
            name: 'dirty',
            component: 'BooleanField',
          },
        ],
      },
    });

    this._bubbleUpLoad();
  }

  _handleLoadFactory() {
    return () => {
      const content = this.get('content');
      if (content) {
        content.emitLoad();
      }
    };
  }

  _bubbleUpLoad() {
    this.on('load', this._handleLoadFactory());
  }
}
