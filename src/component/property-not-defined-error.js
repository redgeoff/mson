export default class PropertyNotDefinedError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'PropertyNotDefinedError';
  }
}
