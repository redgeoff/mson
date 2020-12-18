import testUtils from '../test-utils';
import WrappedComponent from './wrapped-component';
import TextField from '../fields/text-field';
import Form from '../form';

it('should wrap component', () => {
  const component = new WrappedComponent({
    componentToWrap: new TextField({
      name: 'name',
      label: 'Name',
    }),
  });

  component.setValue('Jimmy Page');
  expect(component.getValue()).toEqual('Jimmy Page');
});

it('should support nested wrapping', async () => {
  const first = new WrappedComponent({
    componentToWrap: new Form({
      fields: [
        new TextField({
          name: 'firstName',
        }),
      ],
    }),
  });

  const middle = new WrappedComponent({
    componentToWrap: first,
    fields: [
      new TextField({
        name: 'middleName',
      }),
    ],
  });

  const last = new WrappedComponent({
    componentToWrap: middle,
    fields: [
      new TextField({
        name: 'lastName',
      }),
    ],
  });

  expect(last.mapFields((field) => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'middleName', 'lastName'])
  );

  // The wrapping className is preserved so that we can track the name of the class doing the
  // wrapping
  expect(last.getClassName()).toEqual('WrappedComponent');
});

it('should avoid emitting duplicate create events', async () => {
  const field = new TextField({
    name: 'name',
    label: 'Name',
  });

  const component = new WrappedComponent({
    componentToWrap: field,
  });

  const spy = jest.spyOn(field, 'emitChange');

  await Promise.all([
    component.resolveAfterCreate(),

    // Allow extra time to make sure create not emitted twice
    testUtils.timeout(100),
  ]);

  // Ensure that duplicate "create" events aren't emitted, as triggered by the constructors of both
  // the wrapping and wrapped components
  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy).toHaveBeenCalledWith('create');
  expect(spy).toHaveBeenCalledWith('didCreate', true);
});
