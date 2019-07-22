"use strict";

const redis = require("../redis");
const TinypngAccountModel = require("../db/TinypngAccountModel");
const { getInstance, clearInstances } = require("./tinypng-instance");

/**
 * 消费一次
 * 利用redis进行计数
 */
const consume = async () => {
  const remainCount = await redis.decr("TINYPNG_REMAIN");
  return remainCount >= 0;
};

/**
 * 获取一个还有剩余次数的key
 * @param {string[]} keys
 */
const getAvailableKeyFromKeys = async (keys = []) => {
  if (!keys.length) {
    return false;
  }
  const key = keys[0];
  const remain = await redis.decr(`TINYPNG_REMAIN_${key}`);
  if (remain >= 0) {
    return key;
  }
  return await getAvailableKeyFromKeys(keys.slice(1));
};

/**
 * 从数据库里获取所有tinypng用的key
 */
const getTinypngAccountKeys = async () => {
  const list = await TinypngAccountModel.findAll({});
  return list.map(v => v.key);
};

/**
 * 重算每个账号的剩余次数
 */
const forceUpdateRemain = async () => {
  const list = await TinypngAccountModel.findAll({});
  clearInstances();
  const instances = await Promise.all(list.map(v => getInstance(v.key)));
  let allRemain = 0;
  const promiseTasks = instances
    .map((v, k) => {
      const data = list[k];
      const remain = data.monthlyLimit - v.compressionCount;
      allRemain += remain;
      return redis.set(`TINYPNG_REMAIN_${data.key}`, remain);
    })
    .concat([redis.set("TINYPNG_REMAIN", allRemain)]);
  return Promise.all(promiseTasks);
};

const getAvailableKey = async () => {
  const keys = await getTinypngAccountKeys();
  console.log("keys", keys);
  return getAvailableKeyFromKeys(keys);
};

module.exports = {
  consume,
  getAvailableKey,
  forceUpdateRemain
};
