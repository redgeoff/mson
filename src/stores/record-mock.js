import MemoryStore from './memory-store';

export default class RecordMock {
  constructor() {
    // We use a MemoryStore that we get automatic filtering, pagination, etc...
    this._docs = new MemoryStore();
    // appId: String
    // componentId: String
    // id: String
    // fieldValues: JSON
    // createdAt: String
    // updatedAt: String
    // archivedAt: String
    // userId: String
  }

  async create({ appId, componentName, fieldValues }) {
    const doc = await this._docs._createDoc({ fieldValues /* order */ });

    return {
      data: {
        createRecord: doc
      }
    };
  }

  async get({ appId, componentName, id, where }) {
    const doc = await this._docs.getDoc({ id, where });
    return {
      data: {
        record: doc
      }
    };
  }

  async update({ appId, componentName, id, fieldValues }) {
    const doc = await this._docs._updateDoc({ id, fieldValues /* order */ });
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

  // const response = await this._registrar.client.record.getAll(opts);
  // return response.data.records;
}
