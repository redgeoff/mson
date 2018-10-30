import MemoryStore from './memory-store';

// Mock the record API so that we don't need to test against an actual server
export default class RecordMock {
  constructor() {
    // We use a MemoryStore that we get automatic sorting, querying, etc...
    this._docs = new MemoryStore();
  }

  async create({ appId, componentName, fieldValues, order }) {
    const doc = await this._docs._createDoc({ fieldValues, order });
    return {
      data: {
        createRecord: doc
      }
    };
  }

  async get({ appId, componentName, id, where }) {
    try {
      const doc = await this._docs.getDoc({ id, where });
      return {
        data: {
          record: doc
        }
      };
    } catch (err) {
      // if (err.message === 'value is missing for key ' + id) {
      throw new Error('GraphQL error: record not found');
      // } else {
      //   throw err;
      // }
    }
  }

  async update({ appId, componentName, id, fieldValues, order }) {
    const doc = await this._docs._updateDoc({ id, fieldValues, order });
    return {
      data: {
        updateRecord: doc
      }
    };
  }

  async archive({ appId, componentName, id }) {
    const doc = await this._docs.archiveDoc({ id });
    return {
      data: {
        archiveRecord: doc
      }
    };
  }

  async restore({ appId, componentName, id }) {
    const doc = await this._docs.restoreDoc({ id });
    return {
      data: {
        restoreRecord: doc
      }
    };
  }

  async getAll(opts) {
    const docs = await this._docs.getAllDocs(opts);
    return {
      data: {
        records: {
          edges: docs.edges,

          // TODO: this will probably need adjusted once our tests support pagination
          pageInfo: {
            hasNextPage: false
          }
        }
      }
    };
  }
}
