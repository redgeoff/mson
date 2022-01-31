import Action from './action';
import utils from '../utils/utils';
import PropFiller from '../compiler/prop-filler';

export default class Iterator extends Action {
  className = 'Iterator';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'iterator',
            component: 'Field',
            required: true,
          },
          {
            name: 'return',
            component: 'Field',
            required: true,
          },
        ],
      },
    });
  }

  _getProp(props, path) {
    return utils.get(props, path);
  }

  async act(props) {
    const iterator = this._getProp(props, this.get('iterator'));
    const clonedProps = utils.clone(props);
    const filler = new PropFiller(props);
    return Object.values(iterator).map((item) => {
      // Inject item
      clonedProps.item = item;
      filler.setProps(clonedProps);

      return filler.fillAll(this.get('return'));
    });
  }
}
