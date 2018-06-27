import Action from './action';

// TODO: refactor out and use GetRecord instead
export default class APIGet extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'url', 'object', 'id', 'fields');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'url', 'object', 'id', 'fields');
    return value === undefined ? super.getOne(name) : value;
  }

  _nothingToGet() {
    const fields = this.get('fields');
    return fields && fields.length === 0 ? true : false;
  }

  async act(props) {
    if (!this._nothingToGet()) {
      // TODO: actually query the GraphQL API
      if (this.get('object') === 'User') {
        props.component.set({
          value: {
            id: '1',
            name: 'Nina Simone',
            email: 'nina@example.com'
          }
        });
      }
    }
  }
}
