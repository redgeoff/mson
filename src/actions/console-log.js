import Action from './action';

// Can be used to debug MSON component actions
export default class ConsoleLog extends Action {
  _className = 'ConsoleLog';

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

  async act(props) {
    this._console.log(this.get('message'));

    // Pass on the arguments so that the log can be used in the middle of 2 components
    return props.arguments;
  }
}
