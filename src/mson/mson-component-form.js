import ObjectForm from './form';
import { TextField } from './fields';

export default class MSONComponentForm extends ObjectForm {
  _create(props) {
    super._create(props);
    this.addField(
      new TextField({
        name: 'component'
      })
    );
  }

  // validate() {
  //   super.validate();
  //
  //   if (this._valueSet) {
  //     try {
  //       // Use sift to validate the selector
  //       sift(this._valueSet);
  //     } catch (err) {
  //       this._errorFromSet = err.message;
  //       this.set({ err: true });
  //     }
  //   }
  // }
}
