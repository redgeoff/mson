import UIComponent from './ui-component';

export default class GridItem extends UIComponent {
  className = 'GridItem';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'hidden',
            component: 'BooleanField',
          },
          {
            name: 'content',
            component: 'Field',
          },
          {
            name: 'xl',
            component: 'IntegerField',
          },
          {
            name: 'lg',
            component: 'IntegerField',
          },
          {
            name: 'md',
            component: 'IntegerField',
          },
          {
            name: 'sm',
            component: 'IntegerField',
          },
          {
            name: 'xs',
            component: 'IntegerField',
          },
        ],
      },
    });
  }

  set(props) {
    if (props.content !== undefined) {
      props.content.set({ parent: this });
    }

    super.set(props);
  }
}
