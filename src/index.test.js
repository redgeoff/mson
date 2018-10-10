import * as mson from './index';

it('should bundle', () => {
  mson.compiler.newComponent({
    component: 'Form'
  });
});
