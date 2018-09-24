import Card from './card';
import Form from './form';
import testUtils from './test-utils';

it('should bubble up load events', async () => {
  const form = new Form();

  const emitLoadSpy = jest.spyOn(form, 'emitLoad');

  const card = new Card();

  // Without content
  card._handleLoadFactory()();
  expect(emitLoadSpy).toHaveBeenCalledTimes(0);

  // Set content
  card.set({
    content: form
  });

  const didLoad = testUtils.once(form, 'didLoad');
  card.emitLoad();
  expect(emitLoadSpy).toHaveBeenCalledTimes(1);
  await didLoad;
});
