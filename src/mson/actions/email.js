import Action from './action';
import registrar from '../compiler/registrar';

export default class Email extends Action {
  _create(props) {
    super._create(props);

    this.set({
      props: ['to', 'subject', 'body'],
      schema: {
        component: 'Form',
        fields: [
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
    return registrar.email.send(props);
  }

  async act(props) {
    return this._sendEmail(this.getFilled(['to', 'subject', 'body'], props));
  }
}
