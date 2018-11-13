import Component from './component';

export default class GridItem extends Component {
  _className = 'GridItem';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'hidden',
            component: 'BooleanField'
          },
          {
            name: 'content',
            component: 'Field'
          },
          {
            name: 'xl',
            component: 'IntegerField'
          },
          {
            name: 'lg',
            component: 'IntegerField'
          },
          {
            name: 'md',
            component: 'IntegerField'
          },
          {
            name: 'sm',
            component: 'IntegerField'
          },
          {
            name: 'xs',
            component: 'IntegerField'
          }
        ]
      }
    });
  }

  set(props) {
    if (props.content !== undefined) {
      props.content.set({ parent: this });
    }

    super.set(props);
  }
}
