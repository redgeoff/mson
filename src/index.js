import compiler from './compiler';
import register from './compiler/register';

// Note: the "default" must be excluded so that webpack can bundle the library properly
export { compiler, register };
