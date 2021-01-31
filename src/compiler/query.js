import 'mingo/init/system';
import mingo from 'mingo';

// We can support tree shaking and cherry pick operators, but all the operators in Mingo are useful,
// depending on your use case. Moreover, the largeness of Mingo's bundle size is mostly due to its
// operators, therefore it isn't possible to exclude other core mingo functionality. For now, we'll
// choose not to make any such cherry-picking optimizations.

// import "mingo/init/basic";
// import { useOperators, OperatorType } from "mingo/core";
// import { $cond } from "mingo/operators/expression";
// useOperators(OperatorType.EXPRESSION, { $cond });

export const filter = (collection, query) => {
  const q = new mingo.Query(query);
  const cursor = q.find(collection);
  return cursor.all();
};

export const validateQuery = (query) => {
  const q = new mingo.Query(query);
  q.test([]);
};
