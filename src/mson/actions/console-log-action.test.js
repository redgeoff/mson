import ConsoleLogAction from './console-log-action';
import Form from '../form';
import { PersonNameField } from '../fields';

it('should log message', async () => {
  const consoleLogAction = new ConsoleLogAction({ message: 'foo' });

  // Mock
  consoleLogAction._console = {
    log: () => {}
  };

  const logSpy = jest.spyOn(consoleLogAction._console, 'log');

  await consoleLogAction.run({ arguments: null });

  expect(logSpy).toHaveBeenCalledWith('foo');
});

it('should log property', async () => {
  const component = new Form({
    name: 'myForm',
    fields: [
      new PersonNameField({
        name: 'firstName',
        value: {
          firstName: 'Bob',
          lastName: 'Dylan'
        }
      })
    ]
  });

  const consoleLogAction = new ConsoleLogAction({
    message: '{{fields.firstName.value}}'
  });

  // Mock
  consoleLogAction._console = {
    log: () => {}
  };

  const logSpy = jest.spyOn(consoleLogAction._console, 'log');

  const ran = await consoleLogAction.run({ arguments: 'foo', component });
  expect(ran).toEqual('foo');

  expect(logSpy).toHaveBeenCalledWith({
    firstName: 'Bob',
    lastName: 'Dylan'
  });

  consoleLogAction.set({ message: '{{name}}' });

  logSpy.mockReset();

  await consoleLogAction.run({ arguments: 'foo', component });

  expect(logSpy).toHaveBeenCalledWith('myForm');
});
