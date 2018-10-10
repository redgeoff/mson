import PropFiller from './prop-filler';
import cloneDeep from 'lodash/cloneDeep';

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

it('should handle circular references', () => {
  const props = {
    foo: 'bar',
    nar: {
      yar: 'tar'
    }
  };

  // Define circular reference
  props.nar.props = props;

  const items = {
    a: {
      v: '{{foo}}'
    },
    v: '{{nar.yar}}'
  };

  // Define circular reference
  items.a.items = items;

  const filler = new PropFiller(props);

  const clonedItems = cloneDeep(items);
  clonedItems.a.v = 'bar';
  clonedItems.v = 'tar';
  expect(filler.fillAll(items)).toEqual(clonedItems);
});
