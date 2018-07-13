import Action from './action';

export default class Emit extends Action {
  _create(props) {
    super._create(props);

    this.set({
      props: ['event', 'value']
    });
  }

  async act(props) {
    props.component._emitChange(this.get('event'), this.get('value'));
  }
}
