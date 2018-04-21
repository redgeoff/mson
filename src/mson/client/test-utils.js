import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'node-fetch';
import config from './config.test.json';
import Server from '../../../../mson-server/src/server/server';
import Installer from '../../../../mson-server/src/installer/installer';

class Utils {
  constructor() {
    this.url =
      config.server.protocol +
      '://' +
      config.server.hostname +
      ':' +
      config.server.port +
      config.server.pathname;

    this.client = new ApolloClient({
      link: new HttpLink({ uri: this.url, fetch: fetch }),
      cache: new InMemoryCache()
    });

    // TODO: specify prefix and url in config
    this._server = new Server({
      prefix: config.server.prefix,
      url: config.server.sql.url,
      port: config.server.port,
      logLevel: 'error'
    });

    this._installer = new Installer({
      prefix: config.server.prefix,
      url: config.server.sql.url
    });
  }

  async startServer() {
    await this._server.start();
  }

  async stopServer() {
    await this._server.stop();
  }

  async setUp() {
    await this._installer.install();
  }

  async tearDown() {
    await this._installer.uninstall();
  }
}

export default new Utils();
