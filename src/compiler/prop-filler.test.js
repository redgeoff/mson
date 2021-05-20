import PropFiller from './prop-filler';
import { deepClone } from '../utils/deep-clone';

it('should fill props', () => {
  const props = {
    foo: 'bar',
    nar: {
      yar: 'tar',
      sar: 1,
    },
    notDefined: undefined,
  };
  const filler = new PropFiller(props);

  expect(filler.fillString('{{foo}}')).toEqual('bar');
  expect(filler.fillString('{{nar}}')).toEqual(props.nar);
  expect(filler.fillString('{{nar.yar}}')).toEqual('tar');
  expect(filler.fillString('{{nar.sar}}')).toEqual(1);
  expect(filler.fillString('foo')).toEqual('foo');
  expect(filler.fillString(props.nar)).toEqual(props.nar);
  expect(
    filler.fillString(props.nar, (obj) => ({ ...obj, yar: obj.yar + '2' }))
  ).toEqual({
    yar: 'tar2',
    sar: 1,
  });
  expect(filler.fillString('{{notDefined}}')).toEqual(undefined);
  expect(filler.fillString('{{missing}}')).toEqual('{{missing}}');
  expect(filler.fillString('{{missing}} here')).toEqual('{{missing}} here');

  expect(
    filler.fillAll({
      one: '{{foo}}',
      two: '{{nar}}',
      three: '{{nar.sar}}',
      four: props.nar,
      five: {
        a: '{{foo}}',
      },
    })
  ).toEqual({
    one: 'bar',
    two: props.nar,
    three: 1,
    four: props.nar,
    five: {
      a: 'bar',
    },
  });
});

it('should handle circular references', () => {
  const props = {
    foo: 'bar',
    nar: {
      yar: 'tar',
    },
  };

  // Define circular reference
  props.nar.props = props;

  const items = {
    a: {
      v: '{{foo}}',
    },
    v: '{{nar.yar}}',
  };

  // Define circular reference
  items.a.items = items;

  const filler = new PropFiller(props);

  const clonedItems = deepClone(items);
  clonedItems.a.v = 'bar';
  clonedItems.v = 'tar';
  expect(filler.fillAll(items)).toEqual(clonedItems);
});

it('should handle JSON strings', () => {
  const props = {
    foo: 'bar',
  };
  const filler = new PropFiller(props);

  const form = {
    component: 'Form',
    fields: [
      {
        name: 'definition',
        component: 'Field',
      },
    ],
    value: {
      id: '{{foo}}',
      definition: '{{foo}}',
    },
  };

  expect(filler.fill(JSON.stringify(form))).toEqual(
    JSON.stringify({
      ...form,
      value: {
        id: 'bar',
        definition: 'bar',
      },
    })
  );
});

it('should fill with customizer', () => {
  const props = {
    fizz: 'fizzy',
    foo: {
      buzz: 'bizz',
    },
    nar: {
      sar: 6,
    },
    thing: {
      x: {
        y: 1,
      },
    },
  };
  const filler = new PropFiller(props);

  const customizer = jest.fn().mockImplementation((obj) => {
    if (typeof obj === 'number') {
      return obj + 1;
    } else if (typeof obj === 'string') {
      return obj + '_customized';
    } else {
      return obj;
    }
  });

  const obj = {
    foo: '{{fizz}}-{{foo.buzz}}',
    bar: {
      x: '{{nar.sar}}',
    },
    ob: '{{thing}}',
  };

  expect(filler.fill(obj, null, customizer)).toEqual({
    foo: 'fizzy_customized-bizz_customized',
    bar: { x: 7 },
    ob: { x: { y: 1 } },
  });

  expect(customizer).toHaveBeenCalledTimes(4);
});
