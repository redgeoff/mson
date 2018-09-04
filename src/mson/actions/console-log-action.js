import Action from './action';

// Can be used to debug MSON component actions
export default class ConsoleLogAction extends Action {
  _className = 'ConsoleLogAction';

  _create(props) {
    super._create(props);

    // For mocking
    this._console = console;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'message',
            component: 'TextField'
          }
        ]
      }
    });
  }

  async act(/* props */) {
    this._console.log(this.get('message'));
  }
}
