import { Globals } from './globals';

let globals = null;

beforeEach(() => {
  globals = new Globals();
});

it('should redirect', () => {
  globals.redirect('/home');
  expect(globals.get('redirectPath')).toEqual('/home');
});

it('should set and execute onNavigate', () => {
  const container = {
    onNavigate: () => {}
  };

  const callback = () => {};

  const onNavigateSpy = jest.spyOn(container, 'onNavigate');

  globals.onNavigate();
  expect(onNavigateSpy).toHaveBeenCalledTimes(0);

  globals.setOnNavigate(container.onNavigate);
  globals.onNavigate(null, callback);
  expect(onNavigateSpy).toHaveBeenCalledWith(callback);
});

it('should display confirmation', () => {
  const props = {};
  globals.displayConfirmation(props);
  expect(globals.get('confirmation')).toEqual(props);
});

it('should display alert', () => {
  const props = {};
  globals.displayAlert(props);
  props.alert = true;
  expect(globals.get('confirmation')).toEqual(props);
});
