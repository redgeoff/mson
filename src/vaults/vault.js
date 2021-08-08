// TODO:
// - Actually implement backendOnly logic so that client never gets components
// - Ability to use private key encryption to encrypt vaults

import Component from '../component';

export default class Vault extends Component {
  className = 'Vault';

  create(props) {
    super.create(props);

    this.set({
      backEndOnly: true,
    });
  }
}
