import BaseComponent from './base-component';
import testUtils from '../test-utils';

const NUM_COMPONENTS = 300;

const CREATE_COMPONENTS_TIMEOUT_MS = 300;
it('should create many components quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    for (let i = 0; i < NUM_COMPONENTS; i++) {
      new BaseComponent();
    }
  }, CREATE_COMPONENTS_TIMEOUT_MS);
});

const CLONE_COMPONENTS_TIMEOUT_MS = 300;
it('should clone many components quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    const component = new BaseComponent();
    for (let i = 0; i < NUM_COMPONENTS; i++) {
      component.clone();
    }
  }, CLONE_COMPONENTS_TIMEOUT_MS);
});
