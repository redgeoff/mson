import UIComponent from './ui-component';

export default class App extends UIComponent {
  className = 'App';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'menu',
            component: 'Field',
          },
          {
            name: 'menuAlwaysTemporary',
            component: 'BooleanField',
          },
          {
            name: 'basename',
            component: 'TextField',
            help: "The base URL for all locations. If your app is served from a sub-directory on your server, you'll want to set this to the sub-directory. A properly formatted basename should have a leading slash, but no trailing slash.",
          },
        ],
      },
    });
  }

  emitLoggedOut() {
    this.emitChange('loggedOut');
  }
}
