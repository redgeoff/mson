import User from './user';

export default class Builder {
  constructor(client) {
    this.user = new User(client);
  }
}
