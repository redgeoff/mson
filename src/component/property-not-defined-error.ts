export default class PropertyNotDefinedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PropertyNotDefinedError';
  }
}
