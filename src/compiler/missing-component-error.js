export default class MissingComponentError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'MissingComponentError';
  }
}
