import Action from './action';
import _ from '../lodash';
import PropFiller from '../compiler/prop-filler';

export default class Iterator extends Action {
  _className = 'Iterator';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'iterator',
            component: 'Field',
            required: true
          },
          {
            name: 'return',
            component: 'Field',
            required: true
          }
        ]
      }
    });
  }

  _getProp(props, path) {
    return _.get(props, path);
  }

  async act(props) {
    const iterator = this._getProp(props, this.get('iterator'));
    const clonedProps = _.clone(props);
    const filler = new PropFiller(props);
    return _.map(iterator, item => {
      // Inject item
      clonedProps.item = item;
      filler.setProps(clonedProps);

      return filler.fillAll(this.get('return'));
    });
  }
}
