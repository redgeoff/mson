import Component from './component';

export default class App extends Component {
  _create(props) {
    super._create(props);

    this.set({
      props: ['menu']
    });
  }

  emitLoggedOut() {
    this.emitChange('loggedOut');
  }
}
