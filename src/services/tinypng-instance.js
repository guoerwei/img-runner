"use strict";

const { TinypngInvalidateError } = require("../custom-errors/check-errors");

let _instances = {};
let _instanceLoaders = {};

/**
 * 获取一个tinify实例
 * @param {string} key
 */
const newInstance = async key => {
  const tinify = new require("tinify/lib/tinify");
  tinify.default.Client = require("tinify/lib/tinify/Client").default;
  tinify.default.ResultMeta = require("tinify/lib/tinify/ResultMeta").default;
  tinify.default.Result = require("tinify/lib/tinify/Result").default;
  tinify.default.Source = require("tinify/lib/tinify/Source").default;
  tinify.default.Error = require("tinify/lib/tinify/Error").Error;
  tinify.default.AccountError = require("tinify/lib/tinify/Error").AccountError;
  tinify.default.ClientError = require("tinify/lib/tinify/Error").ClientError;
  tinify.default.ServerError = require("tinify/lib/tinify/Error").ServerError;
  tinify.default.ConnectionError = require("tinify/lib/tinify/Error").ConnectionError;
  const instance = tinify.default;
  instance.key = key;
  try {
    await instance.validate();
    return instance;
  } catch (e) {
    throw new TinypngInvalidateError("tinypng账号验证失败");
  }
};

// 多用户复用promise
const getInstance = async key => {
  if (!_instanceLoaders[key]) {
    _instanceLoaders[key] = newInstance(key);
    const instance = await _instanceLoaders[key];
    _instances[key] = instance;
    return _instances[key];
  }
  return _instanceLoaders[key];
};

const removeInstance = async key => {
  if (_instanceLoaders[key]) {
    delete _instanceLoaders[key];
  }
  if (_instances[key]) {
    delete _instances[key];
  }
};

const clearInstances = () => {
  _instanceLoaders = {};
  _instances = {};
};

module.exports = {
  getInstance,
  removeInstance,
  clearInstances
};
