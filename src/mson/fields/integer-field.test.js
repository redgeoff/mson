import IntegerField from './integer-field';

it('should validate', () => {
  const field = new IntegerField();

  const validValues = ['111', '-111', '+111', '0'];

  validValues.forEach(value => {
    field.clearErr();
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(false);
  });

  const invalidValues = [
    'aaa111',
    '111aaa',
    '123-',
    '123+',
    '1.1',
    '+',
    '0123'
  ];

  invalidValues.forEach(value => {
    field.clearErr();
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(true);
  });
});
