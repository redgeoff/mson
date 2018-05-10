import WrappedComponent from './wrapped-component';
import TextField from '../fields/text-field';

it('should wrap component', () => {
  const component = new WrappedComponent({
    componentToWrap: new TextField({
      name: 'name',
      label: 'Name'
    })
  });

  component.setValue('Jimmy Page');
  expect(component.getValue()).toEqual('Jimmy Page');
});
