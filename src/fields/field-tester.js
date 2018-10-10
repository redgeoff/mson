// TODO: add more tests and use for every field

class FieldTester {
  shouldSetAndGet(props) {
    it('should set and get', () => {
      const field = new props.Field(props.props);
      field.setValue(props.exampleValue);
      expect(field.getValue()).toEqual(props.exampleValue);
    });
  }

  shouldClear(props) {
    it('should clear', () => {
      const field = new props.Field(props.props);

      field.clearValue();
      expect(field.getValue()).toEqual(null);

      field.setValue(props.exampleValue);
      expect(field.getValue()).toEqual(props.exampleValue);
      field.clearValue();
      expect(field.getValue()).toEqual(null);
    });
  }

  shouldAll(props) {
    this.shouldSetAndGet(props);
    this.shouldClear(props);
  }
}

export default new FieldTester();
