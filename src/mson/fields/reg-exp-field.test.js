import RegExpField from './reg-exp-field';

it('should convert from string to regular expression', () => {
  let field = new RegExpField({
    value: '/[1-9]AB/i'
  });
  expect(field.getValue().toString()).toEqual('/[1-9]AB/i');

  field = new RegExpField({
    value: '/[1-9]AB/'
  });
  expect(field.getValue().toString()).toEqual('/[1-9]AB/');

  field = new RegExpField({
    value: '/\\/[1-9]AB\\//'
  });
  expect(field.getValue().toString()).toEqual('/\\/[1-9]AB\\//');
});
