import Mapa from './mapa';

export const noop = () => {};

export const ray = {
  node: {
    id: 'ray',
    name: 'Ray'
  },
  cursor: 'rayCursor'
};

export const ella = {
  node: {
    id: 'ella',
    name: 'Ella'
  },
  cursor: 'ellaCursor'
};

export const records1 = {
  edges: [ray, ella]
};

export const stevie = {
  node: {
    id: 'stevie',
    name: 'Stevie'
  },
  cursor: 'stevieCursor'
};

export const sinatra = {
  node: {
    id: 'sinatra',
    name: 'Sinatra'
  },
  cursor: 'sinatraCursor'
};

export const records2 = {
  edges: [stevie, sinatra]
};

export const michael = {
  node: {
    id: 'michael',
    name: 'Michael'
  },
  cursor: 'michaelCursor'
};

export const bowie = {
  node: {
    id: 'bowie',
    name: 'Bowie'
  },
  cursor: 'bowieCursor'
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
