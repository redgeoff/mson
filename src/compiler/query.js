import sift from 'sift';

export const filter = (collection, query) => {
  return collection.filter(sift(query));
};

export const validateQuery = (query) => {
  sift(query);
};
