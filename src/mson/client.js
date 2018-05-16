// Note: babel-polyfill is needed by client for compilation
import 'babel-polyfill';

import Client from 'mson-client';
import config from './config.json';

const client = new Client({
  url: config.server.url
});

export default client;
