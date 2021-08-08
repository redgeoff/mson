import TextListField from './text-list-field';
import Roles from '../roles';

export default class RolesField extends TextListField {
  className = 'RolesField';

  create(props) {
    super.create(props);
    this.set({
      invalidRegExp: '/^' + Object.keys(Roles.RESERVED).join('|') + '$/',
    });
  }
}
