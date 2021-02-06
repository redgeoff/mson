import { Aggregator } from 'mingo/aggregator';
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

export const isOperator = (key) => {
  // If the key starts with $ then assume it is an operator. This is the same method that mingo
  // uses:
  // https://github.com/kofrasa/mingo/blob/924e8f5d1411a5879983de6c986dfdaf12bcb459/src/util.ts#L890
  return typeof key === 'string' && key[0] === '$';
};

export const executeQuery = (obj) => {
  const agg = new Aggregator([
    {
      $project: {
        value: obj,
      },
    },
  ]);

  // We use an empty collection as substitution of parameters is handled by MSON's template
  // parameters, which are swapped out before the mingo query is run
  const collection = [{}];

  const result = agg.run(collection);

  return result && result[0] && result[0].value;
};

export const filter = (collection, query) => {
  const q = new mingo.Query(query);
  const cursor = q.find(collection);
  return cursor.all();
};

export const validateQuery = (query) => {
  const q = new mingo.Query(query);
  q.test([]);
};
