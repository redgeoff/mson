import { Compiler } from './compiler';
import components from '../components';
import TextField from '../fields/text-field';

let compiler = null;

class NameField extends TextField {
  className = 'app.NameField';

  create(props) {
    super.create(props);
    this.set({ minLength: 5 });
  }
}

beforeEach(() => {
  compiler = new Compiler({ components: { ...components } });
});

it('should support class as component', () => {
  const name = compiler.newComponent({
    component: NameField,
  });
  expect(name.get('minLength')).toEqual(5);
});
