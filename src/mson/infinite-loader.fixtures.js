import Mapa from './mapa';

export const noop = () => {};

export const ray = {
  node: {
    id: 'ray',
    fieldValues: {
      name: 'Ray'
    }
  },
  cursor: 'rayCursor'
};

export const rayFlat = {
  id: 'ray',
  name: 'Ray'
};

export const ella = {
  node: {
    id: 'ella',
    fieldValues: {
      name: 'Ella'
    }
  },
  cursor: 'ellaCursor'
};

export const ellaFlat = {
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
      name: 'Stevie'
    }
  },
  cursor: 'stevieCursor'
};

export const stevieFlat = {
  id: 'stevie',
  name: 'Stevie'
};

export const sinatra = {
  node: {
    id: 'sinatra',
    fieldValues: {
      name: 'Sinatra'
    }
  },
  cursor: 'sinatraCursor'
};

export const sinatraFlat = {
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
      name: 'Michael'
    }
  },
  cursor: 'michaelCursor'
};

export const michaelFlat = {
  id: 'michael',
  name: 'Michael'
};

export const bowie = {
  node: {
    id: 'bowie',
    fieldValues: {
      name: 'Bowie'
    }
  },
  cursor: 'bowieCursor'
};

export const bowieFlat = {
  id: 'bowie',
  name: 'Bowie'
};

export const records3 = {
  edges: [michael, bowie]
};

const noEdges = {
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
      case records1.edges[0].cursor:
        return noEdges;
      case records2.edges[0].cursor:
        return records1;
      case records3.edges[0].cursor:
        return records2;
      default:
        return records3;
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

const asyncNoop = async () => {};

export const createMockedStore = () => {
  return {
    getAll: async props => {
      const records = await onGetAllPeople(props);
      return {
        data: {
          records
        }
      };
    },
    create: asyncNoop,
    update: asyncNoop,
    archive: asyncNoop,
    restore: asyncNoop
  };
};
