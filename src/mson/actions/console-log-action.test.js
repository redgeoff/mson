import ConsoleLogAction from './console-log-action';

it('should log', async () => {
  const consoleLogAction = new ConsoleLogAction({ message: 'foo' });

  // Mock
  consoleLogAction._console = {
    log: () => {}
  };

  const logSpy = jest.spyOn(consoleLogAction._console, 'log');

  await consoleLogAction.act();

  expect(logSpy).toHaveBeenCalledWith('foo');
});
