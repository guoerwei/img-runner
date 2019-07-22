/**
 * redis连接，返回单例
 */

"use strict";

const Redis = require("ioredis");

const { redisConfig } = require("../config");

const redis = new Redis(redisConfig);

module.exports = redis;
