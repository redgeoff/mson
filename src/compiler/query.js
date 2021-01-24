import { Aggregator } from 'mingo/aggregator';
import 'mingo/init/system';

// We can support tree shaking and cherry pick operators, but all the operators in Mingo are useful,
// depending on your use case. Moreover, the largeness of Mingo's bundle size is mostly due to its
// operators, therefore it isn't possible to exclude other core mingo functionality. For now, we'll
// choose not to make any such cherry-picking optimizations.

// import "mingo/init/basic";
// import { useOperators, OperatorType } from "mingo/core";
// import { $cond } from "mingo/operators/expression";
// useOperators(OperatorType.EXPRESSION, { $cond });

const getFirstKey = (obj) => {
  // Note: https://gist.github.com/redgeoff/13e3cb9c9e5a0982529ea3a8cd755382 proves that using
  // Object.keys() is faster than lodash's each with a short circuit
  return Object.keys(obj)[0];
};

const isOperator = (key) => {
  // If the key starts with $ then assume it is an operator. This is the same method that mingo
  // uses:
  // https://github.com/kofrasa/mingo/blob/924e8f5d1411a5879983de6c986dfdaf12bcb459/src/util.ts#L890
  return typeof key === 'string' && key[0] === '$';
};

const isAggregation = (obj) => {
  // Is the first key in the object an operator? e.g.
  // {
  //   $cond: [
  //     {
  //       $eq: ['{{value}}', 'Jack']
  //     },
  //     'is Jack',
  //     'is Jill'
  //   ]
  // }
  //
  // We use this to determine if obj is an aggregation. An alternative to this would be
  // to accept values like `{ mongo: <query> }`, but that adds a lot of bloat.
  const firstKey = getFirstKey(obj);
  return firstKey !== undefined && isOperator(firstKey);
};

export const resolveAnyAggregation = (obj) => {
  if (isAggregation(obj)) {
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
  } else {
    return obj;
  }
};
