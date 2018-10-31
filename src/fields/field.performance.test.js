import testUtils from '../test-utils';
import Field from './field';

const NUM_FIELDS = 300;

const CREATE_FIELDS_TIMEOUT_MS = 400;
it('should create many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    for (let i = 0; i < NUM_FIELDS; i++) {
      new Field();
    }
  }, CREATE_FIELDS_TIMEOUT_MS);
});

const CLONE_FIELDS_TIMEOUT_MS = 600;
it('should clone many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    const field = new Field();
    for (let i = 0; i < NUM_FIELDS; i++) {
      field.clone();
    }
  }, CLONE_FIELDS_TIMEOUT_MS);
});
