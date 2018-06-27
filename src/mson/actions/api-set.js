import Action from './action';
import _ from 'lodash';

// Refactor out and use UpsertRecord instead
export default class APISet extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'url', 'object', 'id', 'fields');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'url', 'object', 'id', 'fields');
    return value === undefined ? super.getOne(name) : value;
  }

  _getComponentValues(props) {
    const fields = this.get('fields');

    // Clone the values as we may be modifying them to remove unwanted fields
    const values = _.cloneDeep(props.component.get('value'));
    if (fields && values) {
      _.each(values, (value, name) => {
        if (fields.indexOf(name) === -1) {
          delete values[name];
        }
      });
    }

    return values;
  }

  async act(props) {
    // TODO: actually query the GraphQL API
    if (this.get('object') === 'User') {
      console.log('saving', this._getComponentValues(props));
    }
  }
}
