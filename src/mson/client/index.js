import API from './api';

// TODO: should this index, just return API and expect the caller to pass in client?
const client = null;

export default new API(client);
