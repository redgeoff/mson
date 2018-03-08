// Sequelize doesn't appear to allow you to create databases so we need an abstraction that can do
// this. https://stackoverflow.com/questions/31294562/sequelize-create-database
//
// TODO:
// 1. Add support for other adapters, especially postgres
// 2. Release as open source

import mysql from 'mysql2/promise'
import { URL } from 'url'

export default class SequelizeExtras {
  constructor(url) {
    this._url = url;
    this._parsedURL(url);
  }

  _parsedURL(url) {
    // e.g. mysql://root:secret@localhost:3306/mydb
    //
    // TODO: use scheme to determine which adapter to use
    this._parsedURL = new URL(url);
  }

  async _ensureConnection() {
    if (!this._connection) {
      this._connection = await mysql.createConnection({
        host: this._parsedURL.hostname,
        port: this._parsedURL.port,
        user: this._parsedURL.username,
        password: this._parsedURL.password,
      })
    }
  }

  async create(dbName) {
    await this._ensureConnection()
    await this._connection.query('CREATE DATABASE ' + dbName)
  }

  async destroy(dbName) {
    await this._ensureConnection()
    await this._connection.query('DROP DATABASE ' + dbName)
  }

  async close() {
    await this._connection.end();
  }
}
