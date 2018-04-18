import PropFiller from './prop-filler';

it('should fill props', () => {
  const props = {
    foo: 'bar',
    nar: {
      yar: 'tar',
      sar: 1
    }
  };
  const filler = new PropFiller(props);

  expect(filler.fill('{{foo}}')).toEqual('bar');
  expect(filler.fill('{{nar}}')).toEqual(props.nar);
  expect(filler.fill('{{nar.yar}}')).toEqual('tar');
  expect(filler.fill('{{nar.sar}}')).toEqual(1);
  expect(filler.fill('foo')).toEqual('foo');
  expect(filler.fill(props.nar)).toEqual(props.nar);
  expect(filler.fill('{{missing}}')).toEqual('{{missing}}');
  expect(filler.fill('{{missing}} here')).toEqual('{{missing}} here');

  expect(
    filler.fillAll({
      one: '{{foo}}',
      two: '{{nar}}',
      three: '{{nar.sar}}',
      four: props.nar,
      five: {
        a: '{{foo}}'
      }
    })
  ).toEqual({
    one: 'bar',
    two: props.nar,
    three: 1,
    four: props.nar,
    five: {
      a: 'bar'
    }
  });
});
