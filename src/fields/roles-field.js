import TextListField from './text-list-field';
import Roles from '../roles';

export default class RolesField extends TextListField {
  _className = 'RolesField';

  _create(props) {
    super._create(props);
    this.set({
      invalidRegExp: '/^' + Object.keys(Roles.RESERVED).join('|') + '$/'
    });
  }
}
