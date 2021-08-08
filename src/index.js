import compiler from './compiler';
import register from './compiler/register';
import compile from './compiler/compile';

// Note: the "default" must be excluded so that webpack can bundle the library properly
export { compiler, register, compile };
