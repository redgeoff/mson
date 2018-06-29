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

  expect(filler.fillString('{{foo}}')).toEqual('bar');
  expect(filler.fillString('{{nar}}')).toEqual(props.nar);
  expect(filler.fillString('{{nar.yar}}')).toEqual('tar');
  expect(filler.fillString('{{nar.sar}}')).toEqual(1);
  expect(filler.fillString('foo')).toEqual('foo');
  expect(filler.fillString(props.nar)).toEqual(props.nar);
  expect(filler.fillString('{{missing}}')).toEqual('{{missing}}');
  expect(filler.fillString('{{missing}} here')).toEqual('{{missing}} here');

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
