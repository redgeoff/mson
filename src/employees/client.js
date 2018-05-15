import Client from '../../../mson-server/src/client';
import config from './config.json';

const client = new Client({
  url: config.server.url
});

export default client;
