export default class FormErr extends Error {
  constructor({ form }) {
    // We stringify the error so that it can be unpacked by any API
    super(JSON.stringify({ message: 'invalid input', error: form.getErrs() }));
    this.name = 'FormErr';
  }
}
