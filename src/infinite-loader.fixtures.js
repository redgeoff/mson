import testUtils from './test-utils';
import Mapa from './mapa';

export const noop = () => {};

const defaults = testUtils.toDefaultFieldsObject(null);

export const ray = {
  node: {
    id: 'ray',
    fieldValues: {
      ...defaults,
      name: 'Ray'
    }
  },
  cursor: 'rayCursor'
};

export const rayFlat = {
  ...defaults,
  id: 'ray',
  name: 'Ray'
};

export const ella = {
  node: {
    id: 'ella',
    fieldValues: {
      ...defaults,
      name: 'Ella'
    }
  },
  cursor: 'ellaCursor'
};

export const ellaFlat = {
  ...defaults,
  id: 'ella',
  name: 'Ella'
};

export const records1 = {
  edges: [ray, ella]
};

export const stevie = {
  node: {
    id: 'stevie',
    fieldValues: {
      ...defaults,
      name: 'Stevie'
    }
  },
  cursor: 'stevieCursor'
};

export const stevieFlat = {
  ...defaults,
  id: 'stevie',
  name: 'Stevie'
};

export const sinatra = {
  node: {
    id: 'sinatra',
    fieldValues: {
      ...defaults,
      name: 'Sinatra'
    }
  },
  cursor: 'sinatraCursor'
};

export const sinatraFlat = {
  ...defaults,
  id: 'sinatra',
  name: 'Sinatra'
};

export const records2 = {
  edges: [stevie, sinatra]
};

export const michael = {
  node: {
    id: 'michael',
    fieldValues: {
      ...defaults,
      name: 'Michael'
    }
  },
  cursor: 'michaelCursor'
};

export const michaelFlat = {
  ...defaults,
  id: 'michael',
  name: 'Michael'
};

export const bowie = {
  node: {
    id: 'bowie',
    fieldValues: {
      ...defaults,
      name: 'Bowie'
    }
  },
  cursor: 'bowieCursor'
};

export const bowieFlat = {
  ...defaults,
  id: 'bowie',
  name: 'Bowie'
};

export const records3 = {
  edges: [michael, bowie]
};

const noEdges = {
  pageInfo: {
    hasNextPage: false
  },
  edges: []
};

export const allRecords = new Mapa();
allRecords.set(records1.edges[0].node.id, { i: 0, ...records1.edges[0] });
allRecords.set(records1.edges[1].node.id, { i: 1, ...records1.edges[1] });
allRecords.set(records2.edges[0].node.id, { i: 2, ...records2.edges[0] });
allRecords.set(records2.edges[1].node.id, { i: 3, ...records2.edges[1] });
allRecords.set(records3.edges[0].node.id, { i: 4, ...records3.edges[0] });
allRecords.set(records3.edges[1].node.id, { i: 5, ...records3.edges[1] });

export const onGetAllPeople = async props => {
  if (!props.before) {
    switch (props.after) {
      case records1.edges[1].cursor:
        return records2;
      case records2.edges[1].cursor:
        return records3;
      case records3.edges[1].cursor:
        return noEdges;
      default:
        return records1;
    }
  } else {
    switch (props.before) {
      // case records1.edges[0].cursor:
      //   return noEdges;
      case records2.edges[0].cursor:
        return records1;
      default:
        //case records3.edges[0].cursor:
        return records2;
      // default:
      //   return records3;
    }
  }
};

export const onGetItemElementMock = id => {
  const i = allRecords.get(id).i;
  return {
    offsetTop: i * 100,
    offsetHeight: 100
  };
};

// const asyncNoop = async () => {};

export const createMockedStore = () => {
  return {
    getAllDocs: async props => {
      return await onGetAllPeople(props);
    },
    // createDoc: asyncNoop,
    updateDoc: async props => {
      return {
        id: props.form.getValue('id')
      };
    },
    // archiveDoc: asyncNoop,
    // restoreDoc: asyncNoop,
    on: noop
  };
};
