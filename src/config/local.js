/**
 * 本地调试用的配置
 * 使用object-spread继承自基础配置
 */

"use strict";

module.exports = {
  ...require("./default"),
  dbConfig: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    pass: "123456",
    db: "img-runner"
  },
  redisConfig: {
    host: "127.0.0.1",
    port: 6379,
    db: 0
  }
};
