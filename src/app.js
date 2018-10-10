import Component from './component';

export default class App extends Component {
  _className = 'App';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'menu',
            component: 'Field'
          },
          {
            name: 'menuAlwaysTemporary',
            component: 'BooleanField'
          }
        ]
      }
    });
  }

  emitLoggedOut() {
    this.emitChange('loggedOut');
  }
}
