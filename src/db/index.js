/**
 * mysql连接，返回单例
 */

"use strict";

const Sequelize = require("sequelize");

const { dbConfig } = require("../config");

const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.pass, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: "mysql",
  timezone: "+08:00"
});

module.exports = sequelize;
