// import App from './app';
import Builder from './builder';

export default class API {
  constructor(client) {
    // this.app = new App(client);
    this.builder = new Builder(client);
  }
}
