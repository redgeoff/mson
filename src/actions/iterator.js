import Action from './action';
import get from 'lodash/get';
import clone from 'lodash/clone';
import map from 'lodash/map';
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
    return get(props, path);
  }

  async act(props) {
    const iterator = this._getProp(props, this.get('iterator'));
    const clonedProps = clone(props);
    const filler = new PropFiller(props);
    return map(iterator, item => {
      // Inject item
      clonedProps.item = item;
      filler.setProps(clonedProps);

      return filler.fillAll(this.get('return'));
    });
  }
}
