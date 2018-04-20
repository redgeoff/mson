import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'node-fetch';
import config from './config.test.json';

class Utils {
  constructor() {
    this.client = new ApolloClient({
      link: new HttpLink({ uri: config.server.url, fetch: fetch }),
      cache: new InMemoryCache()
    });
  }
}

export default new Utils();
