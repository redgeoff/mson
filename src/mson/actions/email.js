import Action from './action';

export default class Email extends Action {
  _className = 'Email';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'from',
            component: 'TextField'
          },
          {
            name: 'sender',
            component: 'TextField'
          },
          {
            name: 'replyTo',
            component: 'TextField'
          },
          {
            name: 'to',
            // Note: TextField as want to allow for multiple recipients
            component: 'TextField'
          },
          {
            name: 'subject',
            component: 'TextField'
          },
          {
            name: 'body',
            component: 'TextField'
          }
        ]
      }
    });

    this._setDefaults(props, { layer: 'backEnd' });
  }

  _sendEmail(props) {
    return this._registrar.email.send(props);
  }

  async act(props) {
    return this._sendEmail(
      this.get(['from', 'sender', 'replyTo', 'to', 'subject', 'body'])
    );
  }
}
