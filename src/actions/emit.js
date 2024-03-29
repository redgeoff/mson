import Action from './action';

export default class Emit extends Action {
  className = 'Emit';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'event',
            component: 'TextField',
          },
          {
            name: 'value',
            component: 'Field',
          },
        ],
      },
    });
  }

  async act(props) {
    props.component.emitChange(this.get('event'), this.get('value'));
  }
}
